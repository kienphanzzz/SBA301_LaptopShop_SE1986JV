package fu.laptopshop.modules.account_catalog.controller;

import fu.laptopshop.modules.account_catalog.dto.LoginRequest;
import fu.laptopshop.modules.account_catalog.dto.RegisterRequest;
import fu.laptopshop.modules.account_catalog.dto.UserProfileResponse;
import fu.laptopshop.modules.account_catalog.service.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AccountService accountService;

    /**
     * Khởi tạo và trả về CSRF token cho SPA frontend trước khi gửi POST/PUT/DELETE.
     */
    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> getCsrfToken(CsrfToken csrfToken) {
        return ResponseEntity.ok(Map.of(
                "token", csrfToken.getToken(),
                "headerName", csrfToken.getHeaderName()
        ));
    }

    /**
     * UC-01: Register Customer Account (BR-01, BR-02, BR-03)
     */
    @PostMapping("/register")
    public ResponseEntity<UserProfileResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserProfileResponse response = accountService.registerCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * UC-02: Login (BR-04, BR-05)
     */
    @PostMapping("/login")
    public ResponseEntity<UserProfileResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        UserProfileResponse response = accountService.login(request, httpRequest, httpResponse);
        return ResponseEntity.ok(response);
    }

    /**
     * UC-03: Logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        accountService.logout(httpRequest, httpResponse);
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công."));
    }
}
