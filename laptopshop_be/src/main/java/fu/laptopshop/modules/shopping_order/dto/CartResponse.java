package fu.laptopshop.modules.shopping_order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {

    @Builder.Default
    private List<CartItemResponse> items = new ArrayList<>();

    private int totalQuantity;

    private BigDecimal totalAmount;
}
