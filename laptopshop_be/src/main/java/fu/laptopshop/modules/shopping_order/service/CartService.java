package fu.laptopshop.modules.shopping_order.service;

import fu.laptopshop.modules.shopping_order.dto.CartItemRequest;
import fu.laptopshop.modules.shopping_order.dto.CartItemResponse;
import fu.laptopshop.modules.shopping_order.dto.CartResponse;

public interface CartService {

    CartResponse getCart(Long userId);

    CartItemResponse addToCart(Long userId, CartItemRequest request);

    CartItemResponse updateQuantity(Long userId, Long laptopId, Integer quantity);

    void removeFromCart(Long userId, Long laptopId);

    void clearCart(Long userId);
}
