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
 * DTO chuẩn bị cho UC-01: Register Customer Account (BR-01, BR-02, BR-03).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Họ tên không được để trống.")
    @Size(max = 150, message = "Họ tên không vượt quá 150 ký tự.")
    private String fullName;

    @NotBlank(message = "Email không được để trống.")
    @Email(message = "Định dạng email không hợp lệ.")
    @Size(max = 150, message = "Email không vượt quá 150 ký tự.")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống.")
    @Pattern(regexp = "^[0-9+\\-\\s]{9,15}$", message = "Số điện thoại phải từ 9 đến 15 ký tự số.")
    private String phone;

    @NotBlank(message = "Mật khẩu không được để trống.")
    @Size(min = 6, max = 72, message = "Mật khẩu phải từ 6 ký tự trở lên.")
    private String password;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống.")
    private String confirmPassword;

    @Size(max = 500, message = "Địa chỉ không vượt quá 500 ký tự.")
    private String address;
}
