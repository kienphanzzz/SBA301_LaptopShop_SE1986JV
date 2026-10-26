package fu.laptopshop.modules.shopping_order.dto;

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
public class WishlistToggleResponse {

    private Long laptopId;
    private boolean added;
    private String message;
}
