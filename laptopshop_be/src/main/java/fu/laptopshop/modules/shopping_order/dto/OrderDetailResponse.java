package fu.laptopshop.modules.shopping_order.dto;

import fu.laptopshop.common.enums.OrderStatus;
import fu.laptopshop.common.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private LocalDateTime orderDate;
    private String receiverName;
    private String phone;
    private String address;
    private PaymentMethod paymentMethod;
    private BigDecimal totalAmount;
    private OrderStatus status;

    @Builder.Default
    private List<OrderItemResponse> items = new ArrayList<>();
}
