package fu.laptopshop.modules.admin_store.service;

import fu.laptopshop.common.entity.Order;
import fu.laptopshop.common.enums.OrderStatus;
import fu.laptopshop.common.exception.ResourceNotFoundException;
import fu.laptopshop.common.repository.OrderRepository;
import fu.laptopshop.modules.admin_store.dto.SalesReportResponse;
import fu.laptopshop.modules.admin_store.dto.UpdateOrderStatusRequest;
import fu.laptopshop.modules.shopping_order.dto.OrderDetailResponse;
import fu.laptopshop.modules.shopping_order.dto.OrderSummaryResponse;
import fu.laptopshop.modules.shopping_order.service.OrderServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminOrderServiceImpl implements AdminOrderService {

    private static final Map<OrderStatus, OrderStatus> ALLOWED_TRANSITIONS = Map.of(
            OrderStatus.PENDING, OrderStatus.CONFIRMED,
            OrderStatus.CONFIRMED, OrderStatus.PACKING,
            OrderStatus.PACKING, OrderStatus.SHIPPING
    );

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getAllOrders(OrderStatus status, String keyword) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        return orderRepository.searchAdminOrders(status, cleanKeyword, Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(OrderServiceImpl::mapToSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderById(Long id) {
        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại với mã #" + id));
        return OrderServiceImpl.mapToDetailResponse(order);
    }

    @Override
    @Transactional
    public OrderDetailResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại với mã #" + id));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus targetStatus = request.getStatus();

        OrderStatus allowedNext = ALLOWED_TRANSITIONS.get(currentStatus);
        if (allowedNext == null || allowedNext != targetStatus) {
            throw new IllegalArgumentException("Không thể chuyển trạng thái từ " + currentStatus + " sang " + targetStatus + ".");
        }

        order.setStatus(targetStatus);
        Order saved = orderRepository.save(order);
        return OrderServiceImpl.mapToDetailResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesReportResponse getSalesReport(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime start = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime end = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        List<Order> completedOrders = orderRepository.findOrdersByStatusBetween(OrderStatus.COMPLETED, start, end);
        List<OrderSummaryResponse> summaries = completedOrders.stream()
                .map(OrderServiceImpl::mapToSummaryResponse)
                .toList();

        BigDecimal totalRevenue = completedOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return SalesReportResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .completedOrderCount(completedOrders.size())
                .totalRevenue(totalRevenue)
                .orders(summaries)
                .build();
    }
}
