package fu.laptopshop.modules.account_catalog.controller;

import fu.laptopshop.config.CustomUserDetails;
import fu.laptopshop.modules.account_catalog.dto.UpdateProfileRequest;
import fu.laptopshop.modules.account_catalog.dto.UserProfileResponse;
import fu.laptopshop.modules.account_catalog.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AccountService accountService;

    /**
     * UC-04: Lấy thông tin cá nhân của người dùng đang đăng nhập từ SecurityContext.
     * Tuyệt đối không nhận userId từ query hay request body của client.
     */
    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Long authenticatedUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(accountService.getProfile(authenticatedUserId));
    }

    /**
     * UC-04: Cập nhật thông tin cá nhân của chính người dùng đang đăng nhập (BR-06).
     * Chỉ cho phép cập nhật fullName, phone, address.
     */
    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long authenticatedUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(accountService.updateProfile(authenticatedUserId, request));
    }
}
