package fu.laptopshop.modules.admin_store.dto;

import fu.laptopshop.common.enums.CommonStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class AdminLaptopRequest {

    @NotBlank(message = "Mã SKU không được để trống.")
    @Size(max = 50, message = "Mã SKU không được vượt quá 50 ký tự.")
    private String sku;

    @NotBlank(message = "Tên laptop không được để trống.")
    @Size(max = 200, message = "Tên laptop không được vượt quá 200 ký tự.")
    private String name;

    @NotNull(message = "Thương hiệu không được để trống.")
    private Long brandId;

    @NotNull(message = "Danh mục không được để trống.")
    private Long categoryId;

    @NotNull(message = "Giá bán không được để trống.")
    @DecimalMin(value = "0.01", message = "Giá bán phải lớn hơn 0.")
    private BigDecimal price;

    private BigDecimal oldPrice;

    @NotNull(message = "Số lượng tồn kho không được để trống.")
    @Min(value = 0, message = "Tồn kho không được là số âm.")
    private Integer stockQuantity;

    @NotNull(message = "Trạng thái không được để trống.")
    private CommonStatus status;

    private String image;

    private String specs;

    private String description;
}
