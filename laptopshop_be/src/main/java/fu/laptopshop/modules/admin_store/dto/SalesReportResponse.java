package fu.laptopshop.modules.admin_store.dto;

import fu.laptopshop.modules.shopping_order.dto.OrderSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReportResponse {

    private LocalDate fromDate;
    private LocalDate toDate;
    private int completedOrderCount;
    private BigDecimal totalRevenue;

    @Builder.Default
    private List<OrderSummaryResponse> orders = new ArrayList<>();
}
