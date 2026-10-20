package fu.laptopshop.modules.shopping_order.service;

import fu.laptopshop.common.entity.CartItem;
import fu.laptopshop.common.entity.Laptop;
import fu.laptopshop.common.entity.User;
import fu.laptopshop.common.enums.CommonStatus;
import fu.laptopshop.common.exception.ResourceNotFoundException;
import fu.laptopshop.common.repository.CartItemRepository;
import fu.laptopshop.common.repository.LaptopRepository;
import fu.laptopshop.common.repository.UserRepository;
import fu.laptopshop.common.util.LaptopMapper;
import fu.laptopshop.modules.shopping_order.dto.CartItemRequest;
import fu.laptopshop.modules.shopping_order.dto.CartItemResponse;
import fu.laptopshop.modules.shopping_order.dto.CartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final LaptopRepository laptopRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtAsc(userId);
        List<CartItemResponse> responses = cartItems.stream()
                .map(this::mapToResponse)
                .toList();

        int totalQuantity = responses.stream().mapToInt(CartItemResponse::getQuantity).sum();
        BigDecimal totalAmount = responses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .items(responses)
                .totalQuantity(totalQuantity)
                .totalAmount(totalAmount)
                .build();
    }

    @Override
    @Transactional
    public CartItemResponse addToCart(Long userId, CartItemRequest request) {
        Laptop laptop = laptopRepository.findById(request.getLaptopId())
                .orElseThrow(() -> new ResourceNotFoundException("Laptop không tồn tại với mã #" + request.getLaptopId()));

        if (laptop.getStatus() != CommonStatus.ACTIVE || laptop.getStockQuantity() == null || laptop.getStockQuantity() <= 0) {
            throw new IllegalArgumentException("Sản phẩm hiện không thể đặt mua (ngừng kinh doanh hoặc hết hàng).");
        }

        Optional<CartItem> existing = cartItemRepository.findByUserIdAndLaptopId(userId, request.getLaptopId());
        int currentQty = existing.map(CartItem::getQuantity).orElse(0);
        int newQty = currentQty + request.getQuantity();

        if (newQty > laptop.getStockQuantity()) {
            throw new IllegalArgumentException("Số lượng trong giỏ (" + newQty + ") vượt quá tồn kho hiện có (" + laptop.getStockQuantity() + ").");
        }

        CartItem cartItem;
        if (existing.isPresent()) {
            cartItem = existing.get();
            cartItem.setQuantity(newQty);
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại."));
            cartItem = CartItem.builder()
                    .user(user)
                    .laptop(laptop)
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CartItemResponse updateQuantity(Long userId, Long laptopId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException("Số lượng phải từ 1 trở lên.");
        }

        CartItem cartItem = cartItemRepository.findByUserIdAndLaptopId(userId, laptopId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng."));

        Laptop laptop = cartItem.getLaptop();
        if (laptop.getStatus() != CommonStatus.ACTIVE || laptop.getStockQuantity() == null || laptop.getStockQuantity() <= 0) {
            throw new IllegalArgumentException("Sản phẩm đã ngừng kinh doanh hoặc hết hàng.");
        }

        if (quantity > laptop.getStockQuantity()) {
            throw new IllegalArgumentException("Số lượng yêu cầu (" + quantity + ") vượt quá số lượng trong kho (" + laptop.getStockQuantity() + ").");
        }

        cartItem.setQuantity(quantity);
        CartItem saved = cartItemRepository.save(cartItem);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void removeFromCart(Long userId, Long laptopId) {
        cartItemRepository.findByUserIdAndLaptopId(userId, laptopId)
                .ifPresent(cartItemRepository::delete);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserIdOrderByCreatedAtAsc(userId);
        cartItemRepository.deleteAll(items);
    }

    private CartItemResponse mapToResponse(CartItem item) {
        BigDecimal price = item.getLaptop().getPrice() != null ? item.getLaptop().getPrice() : BigDecimal.ZERO;
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemResponse.builder()
                .id(item.getId())
                .laptopId(item.getLaptop().getId())
                .laptop(LaptopMapper.toLaptopResponse(item.getLaptop()))
                .quantity(item.getQuantity())
                .unitPrice(price)
                .subtotal(subtotal)
                .build();
    }
}
