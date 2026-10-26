package fu.laptopshop.modules.account_catalog.service;

import fu.laptopshop.common.entity.RefreshToken;
import fu.laptopshop.common.entity.User;
import fu.laptopshop.common.enums.CommonStatus;
import fu.laptopshop.common.repository.RefreshTokenRepository;
import fu.laptopshop.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final SecureRandom random = new SecureRandom();

    @Value("${security.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public record RefreshResult(String newAccessToken, String newRawRefreshToken, User user) {}

    @Transactional
    public String createRefreshToken(User user) {
        if (refreshExpirationMs <= 0) {
            throw new IllegalStateException("Refresh expiration must be positive");
        }
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        RefreshToken token = RefreshToken.builder()
                .tokenHash(hash(rawToken))
                .user(user)
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusMillis(refreshExpirationMs))
                .build();

        refreshTokenRepository.save(token);
        return rawToken;
    }

    @Transactional
    public RefreshResult rotateRefreshToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token không được để trống.");
        }

        RefreshToken oldToken = refreshTokenRepository.findForUpdate(hash(rawToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ hoặc không tồn tại."));

        if (oldToken.getRevokedAt() != null || !oldToken.getExpiresAt().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token đã hết hạn hoặc đã bị thu hồi.");
        }

        User user = oldToken.getUser();
        if (user.getStatus() != CommonStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.");
        }

        // Token Rotation: Thu hồi token cũ và sinh token mới
        oldToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(oldToken);

        String newRawRefreshToken = createRefreshToken(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtService.generateAccessToken(userDetails);

        return new RefreshResult(newAccessToken, newRawRefreshToken, user);
    }

    @Transactional
    public void revokeRefreshToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findForUpdate(hash(rawToken)).ifPresent(token -> {
            if (token.getRevokedAt() == null) {
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
            }
        });
    }

    public static String hash(String text) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }
}
