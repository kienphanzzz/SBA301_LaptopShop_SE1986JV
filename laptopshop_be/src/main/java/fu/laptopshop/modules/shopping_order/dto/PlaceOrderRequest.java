package fu.laptopshop.modules.shopping_order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class PlaceOrderRequest {

    @NotBlank(message = "Họ tên người nhận không được để trống.")
    @Size(max = 150, message = "Họ tên người nhận không được vượt quá 150 ký tự.")
    private String receiverName;

    @NotBlank(message = "Số điện thoại nhận hàng không được để trống.")
    @Pattern(regexp = "^\\d{9,11}$", message = "Số điện thoại phải từ 9 đến 11 chữ số.")
    private String phone;

    @NotBlank(message = "Địa chỉ nhận hàng không được để trống.")
    @Size(max = 500, message = "Địa chỉ nhận hàng không được vượt quá 500 ký tự.")
    private String address;
}
