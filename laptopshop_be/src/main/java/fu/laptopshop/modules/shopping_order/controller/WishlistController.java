package fu.laptopshop.modules.shopping_order.controller;

import fu.laptopshop.config.CustomUserDetails;
import fu.laptopshop.modules.shopping_order.dto.WishlistItemResponse;
import fu.laptopshop.modules.shopping_order.dto.WishlistToggleResponse;
import fu.laptopshop.modules.shopping_order.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemResponse>> getWishlist(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(wishlistService.getWishlist(currentUser.getId()));
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getWishlistLaptopIds(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(wishlistService.getWishlistLaptopIds(currentUser.getId()));
    }

    @PostMapping("/{laptopId}/toggle")
    public ResponseEntity<WishlistToggleResponse> toggleWishlist(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long laptopId
    ) {
        return ResponseEntity.ok(wishlistService.toggleWishlist(currentUser.getId(), laptopId));
    }

    @DeleteMapping("/{laptopId}")
    public ResponseEntity<Void> removeFromWishlist(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long laptopId
    ) {
        wishlistService.removeFromWishlist(currentUser.getId(), laptopId);
        return ResponseEntity.noContent().build();
    }
}
