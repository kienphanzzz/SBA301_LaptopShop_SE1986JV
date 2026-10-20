package fu.laptopshop.modules.admin_store.dto;

import fu.laptopshop.common.enums.CommonStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class AdminTaxonomyRequest {

    @NotBlank(message = "Tên không được để trống.")
    @Size(max = 100, message = "Tên không được vượt quá 100 ký tự.")
    private String name;

    private String description;

    @Builder.Default
    private CommonStatus status = CommonStatus.ACTIVE;
}
