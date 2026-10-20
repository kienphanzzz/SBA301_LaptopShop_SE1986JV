package fu.laptopshop.modules.admin_store.service;

import fu.laptopshop.common.enums.OrderStatus;
import fu.laptopshop.modules.admin_store.dto.SalesReportResponse;
import fu.laptopshop.modules.admin_store.dto.UpdateOrderStatusRequest;
import fu.laptopshop.modules.shopping_order.dto.OrderDetailResponse;
import fu.laptopshop.modules.shopping_order.dto.OrderSummaryResponse;

import java.time.LocalDate;
import java.util.List;

public interface AdminOrderService {

    List<OrderSummaryResponse> getAllOrders(OrderStatus status, String keyword);

    OrderDetailResponse getOrderById(Long id);

    OrderDetailResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);

    SalesReportResponse getSalesReport(LocalDate fromDate, LocalDate toDate);
}
