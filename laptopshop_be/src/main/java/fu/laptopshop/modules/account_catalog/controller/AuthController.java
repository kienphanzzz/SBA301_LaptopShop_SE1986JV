package fu.laptopshop.modules.account_catalog.controller;

import fu.laptopshop.common.entity.User;
import fu.laptopshop.common.repository.UserRepository;
import fu.laptopshop.modules.account_catalog.dto.LoginRequest;
import fu.laptopshop.modules.account_catalog.dto.RegisterRequest;
import fu.laptopshop.modules.account_catalog.dto.UserProfileResponse;
import fu.laptopshop.modules.account_catalog.service.AccountService;
import fu.laptopshop.modules.account_catalog.service.JwtService;
import fu.laptopshop.modules.account_catalog.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AccountService accountService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Value("${security.jwt.cookie-secure:false}")
    private boolean cookieSecure;

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
     * UC-02: Login (Task 5 & 6: JWT Access Token + Refresh Token HttpOnly Cookie)
     */
    @PostMapping("/login")
    public ResponseEntity<UserProfileResponse> login(@Valid @RequestBody LoginRequest request) {
        UserProfileResponse profile = accountService.authenticateAndGetUser(request);

        User user = userRepository.findById(profile.getId()).orElseThrow();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        String accessToken = jwtService.generateAccessToken(userDetails);
        String rawRefreshToken = refreshTokenService.createRefreshToken(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie(accessToken).toString(), refreshCookie(rawRefreshToken).toString())
                .body(profile);
    }

    /**
     * Task 6: Refresh Access Token khi Access Token hết hạn
     */
    @PostMapping("/refresh")
    public ResponseEntity<UserProfileResponse> refresh(
            @CookieValue(name = "refresh_token", required = false) String rawRefreshToken
    ) {
        RefreshTokenService.RefreshResult result = refreshTokenService.rotateRefreshToken(rawRefreshToken);

        UserProfileResponse profile = UserProfileResponse.builder()
                .id(result.user().getId())
                .fullName(result.user().getFullName())
                .email(result.user().getEmail())
                .phone(result.user().getPhone())
                .address(result.user().getAddress())
                .role(result.user().getRole())
                .status(result.user().getStatus())
                .createdAt(result.user().getCreatedAt())
                .updatedAt(result.user().getUpdatedAt())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie(result.newAccessToken()).toString(), refreshCookie(result.newRawRefreshToken()).toString())
                .body(profile);
    }

    /**
     * UC-03: Logout (Xóa cookie access_token, refresh_token và thu hồi trong DB)
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @CookieValue(name = "refresh_token", required = false) String rawRefreshToken
    ) {
        refreshTokenService.revokeRefreshToken(rawRefreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, emptyCookie("access_token", "/").toString(), emptyCookie("refresh_token", "/api/v1/auth").toString())
                .body(Map.of("message", "Đăng xuất thành công."));
    }

    private ResponseCookie accessCookie(String token) {
        return ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMillis(jwtService.getAccessExpirationMs()))
                .build();
    }

    private ResponseCookie refreshCookie(String token) {
        return ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(Duration.ofMillis(refreshTokenService.getRefreshExpirationMs()))
                .build();
    }

    private ResponseCookie emptyCookie(String name, String path) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path(path)
                .maxAge(Duration.ZERO)
                .build();
    }
}
