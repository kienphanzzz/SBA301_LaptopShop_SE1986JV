package fu.laptopshop.modules.shopping_order.controller;

import fu.laptopshop.config.CustomUserDetails;
import fu.laptopshop.modules.shopping_order.dto.OrderDetailResponse;
import fu.laptopshop.modules.shopping_order.dto.OrderSummaryResponse;
import fu.laptopshop.modules.shopping_order.dto.PlaceOrderRequest;
import fu.laptopshop.modules.shopping_order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDetailResponse> placeOrder(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody PlaceOrderRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(currentUser.getId(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<OrderSummaryResponse>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(orderService.getMyOrders(currentUser.getId()));
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<OrderDetailResponse> getMyOrderDetail(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(orderService.getMyOrderDetail(currentUser.getId(), id));
    }

    @PostMapping("/me/{id}/cancel")
    public ResponseEntity<OrderDetailResponse> cancelOrder(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(orderService.cancelOrder(currentUser.getId(), id));
    }

    @PostMapping("/me/{id}/confirm-received")
    public ResponseEntity<OrderDetailResponse> confirmReceived(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(orderService.confirmReceived(currentUser.getId(), id));
    }
}
