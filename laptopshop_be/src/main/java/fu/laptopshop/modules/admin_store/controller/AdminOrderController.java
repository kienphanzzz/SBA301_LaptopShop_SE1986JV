package fu.laptopshop.modules.admin_store.controller;

import fu.laptopshop.common.enums.OrderStatus;
import fu.laptopshop.modules.admin_store.dto.SalesReportResponse;
import fu.laptopshop.modules.admin_store.dto.UpdateOrderStatusRequest;
import fu.laptopshop.modules.admin_store.service.AdminOrderService;
import fu.laptopshop.modules.shopping_order.dto.OrderDetailResponse;
import fu.laptopshop.modules.shopping_order.dto.OrderSummaryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping("/orders")
    public ResponseEntity<List<OrderSummaryResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(adminOrderService.getAllOrders(status, keyword));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderDetailResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(adminOrderService.getOrderById(id));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<OrderDetailResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(adminOrderService.updateOrderStatus(id, request));
    }

    @GetMapping("/reports/sales")
    public ResponseEntity<SalesReportResponse> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return ResponseEntity.ok(adminOrderService.getSalesReport(fromDate, toDate));
    }
}
