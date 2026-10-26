package fu.laptopshop.modules.shopping_order.service;

import fu.laptopshop.modules.shopping_order.dto.WishlistItemResponse;
import fu.laptopshop.modules.shopping_order.dto.WishlistToggleResponse;

import java.util.List;

public interface WishlistService {

    List<WishlistItemResponse> getWishlist(Long userId);

    List<Long> getWishlistLaptopIds(Long userId);

    WishlistToggleResponse toggleWishlist(Long userId, Long laptopId);

    void removeFromWishlist(Long userId, Long laptopId);
}
