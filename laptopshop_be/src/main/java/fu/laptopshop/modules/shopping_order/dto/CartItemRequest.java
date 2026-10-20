package fu.laptopshop.modules.shopping_order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemRequest {

    @NotNull(message = "Mã laptop không được để trống.")
    private Long laptopId;

    @NotNull(message = "Số lượng không được để trống.")
    @Min(value = 1, message = "Số lượng đặt phải từ 1 trở lên.")
    private Integer quantity;
}
