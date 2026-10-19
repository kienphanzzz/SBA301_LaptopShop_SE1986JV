package fu.laptopshop.modules.account_catalog.dto;

import fu.laptopshop.common.enums.CommonStatus;
import fu.laptopshop.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả thông tin User cho UC-01, UC-02, UC-04.
 * Tuyệt đối KHÔNG chứa trường passwordHash (NFR 8.3 Security).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private UserRole role;
    private CommonStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
