package fu.laptopshop.modules.account_catalog.dto;

import fu.laptopshop.common.enums.CommonStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LaptopResponse {
    private Long id;
    private String sku;
    private String name;
    private Long brandId;
    private String brandName;
    private Long categoryId;
    private String categoryName;
    private String specs;
    private String description;
    private String image;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private Integer stockQuantity;
    private CommonStatus status;
    private boolean inStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
