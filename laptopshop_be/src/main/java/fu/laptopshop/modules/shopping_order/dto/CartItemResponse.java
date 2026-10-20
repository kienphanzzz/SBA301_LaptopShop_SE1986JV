package fu.laptopshop.modules.shopping_order.dto;

import fu.laptopshop.modules.account_catalog.dto.LaptopResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private Long id;
    private Long laptopId;
    private LaptopResponse laptop;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
