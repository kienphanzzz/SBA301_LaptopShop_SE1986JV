package fu.laptopshop.modules.account_catalog.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho UC-01: Register Customer Account (BR-01, BR-02, BR-03).
 * Không chứa trường role hay status để ngăn người dùng tự gán quyền ADMIN.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Họ và tên không được để trống.")
    @Size(max = 150, message = "Họ và tên không vượt quá 150 ký tự.")
    private String fullName;

    @NotBlank(message = "Email không được để trống.")
    @Email(message = "Định dạng email không hợp lệ.")
    @Size(max = 150, message = "Email không vượt quá 150 ký tự.")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống.")
    @Pattern(regexp = "^0\\d{8,10}$", message = "Số điện thoại phải bắt đầu bằng số 0 và gồm 9 đến 11 chữ số.")
    private String phone;

    @NotBlank(message = "Mật khẩu không được để trống.")
    @Size(min = 6, max = 72, message = "Mật khẩu phải có từ 6 đến 72 ký tự.")
    private String password;

    private String confirmPassword;
}
