package fu.laptopshop.modules.account_catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho UC-04: Update Personal Profile (BR-06).
 * Chỉ cho phép cập nhật fullName, phone, address (không cho sửa email, role, status).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @NotBlank(message = "Họ và tên không được để trống.")
    @Size(max = 150, message = "Họ và tên không vượt quá 150 ký tự.")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống.")
    @Pattern(regexp = "^0\\d{8,10}$", message = "Số điện thoại phải bắt đầu bằng số 0 và gồm 9 đến 11 chữ số.")
    private String phone;

    @Size(max = 500, message = "Địa chỉ nhận hàng không vượt quá 500 ký tự.")
    private String address;
}
