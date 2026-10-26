package fu.laptopshop.modules.shopping_order.service;

import fu.laptopshop.common.entity.CartItem;
import fu.laptopshop.common.entity.Laptop;
import fu.laptopshop.common.entity.Order;
import fu.laptopshop.common.entity.OrderItem;
import fu.laptopshop.common.entity.User;
import fu.laptopshop.common.enums.CommonStatus;
import fu.laptopshop.common.enums.OrderStatus;
import fu.laptopshop.common.enums.PaymentMethod;
import fu.laptopshop.common.exception.ResourceNotFoundException;
import fu.laptopshop.common.repository.CartItemRepository;
import fu.laptopshop.common.repository.LaptopRepository;
import fu.laptopshop.common.repository.OrderRepository;
import fu.laptopshop.common.repository.UserRepository;
import fu.laptopshop.modules.shopping_order.dto.OrderDetailResponse;
import fu.laptopshop.modules.shopping_order.dto.OrderItemResponse;
import fu.laptopshop.modules.shopping_order.dto.OrderSummaryResponse;
import fu.laptopshop.modules.shopping_order.dto.PlaceOrderRequest;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final LaptopRepository laptopRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public OrderDetailResponse placeOrder(Long userId, PlaceOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại."));

        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtAsc(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng đang trống. Không thể tạo đơn hàng.");
        }

        Map<Long, Laptop> lockedLaptops = new HashMap<>();
        for (CartItem cartItem : cartItems.stream()
                .sorted(Comparator.comparing(item -> item.getLaptop().getId()))
                .toList()) {
            Long laptopId = cartItem.getLaptop().getId();
            if (!lockedLaptops.containsKey(laptopId)) {
                Laptop laptop = laptopRepository.findByIdForUpdate(laptopId)
                        .orElseThrow(() -> new ResourceNotFoundException("Laptop không tồn tại với mã #" + laptopId));
                entityManager.refresh(laptop, LockModeType.PESSIMISTIC_WRITE);
                lockedLaptops.put(laptopId, laptop);
            }
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Laptop laptop = lockedLaptops.get(cartItem.getLaptop().getId());
            if (laptop.getStatus() != CommonStatus.ACTIVE) {
                throw new IllegalArgumentException("Sản phẩm '" + laptop.getName() + "' hiện đã ngừng kinh doanh.");
            }
            if (laptop.getStockQuantity() == null || laptop.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException("Sản phẩm '" + laptop.getName() + "' không đủ số lượng trong kho.");
            }

            laptop.setStockQuantity(laptop.getStockQuantity() - cartItem.getQuantity());
            laptopRepository.save(laptop);

            BigDecimal unitPrice = laptop.getPrice() != null ? laptop.getPrice() : BigDecimal.ZERO;
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .laptop(laptop)
                    .productName(laptop.getName())
                    .unitPrice(unitPrice)
                    .quantity(cartItem.getQuantity())
                    .build();
            orderItems.add(orderItem);
        }

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .receiverName(request.getReceiverName().trim())
                .phone(request.getPhone().trim())
                .address(request.getAddress().trim())
                .paymentMethod(PaymentMethod.COD)
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setOrderItems(orderItems);

        Order saved = orderRepository.save(order);
        cartItemRepository.deleteAll(cartItems);

        return mapToDetailResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(OrderServiceImpl::mapToSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponse getMyOrderDetail(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng #" + orderId));
        return mapToDetailResponse(order);
    }

    @Override
    @Transactional
    public OrderDetailResponse cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserIdForUpdate(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng #" + orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ được hủy đơn hàng khi trạng thái là PENDING.");
        }

        order = orderRepository.findWithItemsByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng #" + orderId));
        order.setStatus(OrderStatus.CANCELLED);

        if (order.getOrderItems() != null) {
            List<OrderItem> items = order.getOrderItems().stream()
                    .sorted(Comparator.comparing(item -> item.getLaptop().getId()))
                    .toList();
            for (OrderItem item : items) {
                Laptop laptop = laptopRepository.findByIdForUpdate(item.getLaptop().getId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Laptop không tồn tại với mã #" + item.getLaptop().getId()));
                entityManager.refresh(laptop, LockModeType.PESSIMISTIC_WRITE);
                int currentStock = laptop.getStockQuantity() != null ? laptop.getStockQuantity() : 0;
                laptop.setStockQuantity(currentStock + item.getQuantity());
                laptopRepository.save(laptop);
            }
        }

        Order saved = orderRepository.save(order);
        return mapToDetailResponse(saved);
    }

    @Override
    @Transactional
    public OrderDetailResponse confirmReceived(Long userId, Long orderId) {
        Order order = orderRepository.findWithItemsByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng #" + orderId));

        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new IllegalArgumentException("Chỉ được xác nhận nhận hàng khi đơn hàng đang ở trạng thái SHIPPING.");
        }

        order.setStatus(OrderStatus.COMPLETED);
        Order saved = orderRepository.save(order);
        return mapToDetailResponse(saved);
    }

    public static OrderSummaryResponse mapToSummaryResponse(Order order) {
        int totalItems = order.getOrderItems() != null
                ? order.getOrderItems().stream().mapToInt(OrderItem::getQuantity).sum()
                : 0;

        return OrderSummaryResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .orderDate(order.getOrderDate())
                .receiverName(order.getReceiverName())
                .phone(order.getPhone())
                .address(order.getAddress())
                .paymentMethod(order.getPaymentMethod())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .totalItems(totalItems)
                .build();
    }

    public static OrderDetailResponse mapToDetailResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems() != null
                ? order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .laptopId(item.getLaptop() != null ? item.getLaptop().getId() : null)
                        .productName(item.getProductName())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .toList()
                : List.of();

        return OrderDetailResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .orderDate(order.getOrderDate())
                .receiverName(order.getReceiverName())
                .phone(order.getPhone())
                .address(order.getAddress())
                .paymentMethod(order.getPaymentMethod())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .items(itemResponses)
                .build();
    }
}
