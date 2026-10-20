package fu.laptopshop.modules.shopping_order.service;

import fu.laptopshop.modules.shopping_order.dto.OrderDetailResponse;
import fu.laptopshop.modules.shopping_order.dto.OrderSummaryResponse;
import fu.laptopshop.modules.shopping_order.dto.PlaceOrderRequest;

import java.util.List;

public interface OrderService {

    OrderDetailResponse placeOrder(Long userId, PlaceOrderRequest request);

    List<OrderSummaryResponse> getMyOrders(Long userId);

    OrderDetailResponse getMyOrderDetail(Long userId, Long orderId);

    OrderDetailResponse cancelOrder(Long userId, Long orderId);

    OrderDetailResponse confirmReceived(Long userId, Long orderId);
}
