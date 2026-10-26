package fu.laptopshop.modules.shopping_order.dto;

import fu.laptopshop.modules.account_catalog.dto.LaptopResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemResponse {

    private Long id;
    private Long laptopId;
    private LaptopResponse laptop;
    private LocalDateTime createdAt;
}
