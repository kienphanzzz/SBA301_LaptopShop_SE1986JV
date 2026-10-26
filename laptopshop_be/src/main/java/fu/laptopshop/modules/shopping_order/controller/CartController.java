package fu.laptopshop.modules.shopping_order.controller;

import fu.laptopshop.config.CustomUserDetails;
import fu.laptopshop.modules.shopping_order.dto.CartItemRequest;
import fu.laptopshop.modules.shopping_order.dto.CartItemResponse;
import fu.laptopshop.modules.shopping_order.dto.CartResponse;
import fu.laptopshop.modules.shopping_order.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(cartService.getCart(currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<CartItemResponse> addToCart(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody CartItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cartService.addToCart(currentUser.getId(), request));
    }

    @PutMapping("/{laptopId}")
    public ResponseEntity<CartItemResponse> updateQuantity(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long laptopId,
            @RequestParam(required = false) Integer quantity,
            @RequestBody(required = false) CartItemRequest body
    ) {
        Integer targetQuantity = quantity != null ? quantity : (body != null ? body.getQuantity() : null);
        return ResponseEntity.ok(cartService.updateQuantity(currentUser.getId(), laptopId, targetQuantity));
    }

    @DeleteMapping("/{laptopId}")
    public ResponseEntity<Void> removeFromCart(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long laptopId
    ) {
        cartService.removeFromCart(currentUser.getId(), laptopId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        cartService.clearCart(currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
