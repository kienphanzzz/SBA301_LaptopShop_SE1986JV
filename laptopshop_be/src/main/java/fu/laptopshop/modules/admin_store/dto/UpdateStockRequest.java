package fu.laptopshop.modules.admin_store.dto;

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
public class UpdateStockRequest {

    @NotNull(message = "Số lượng tồn kho không được để trống.")
    @Min(value = 0, message = "Số lượng tồn kho không được âm.")
    private Integer stockQuantity;
}
