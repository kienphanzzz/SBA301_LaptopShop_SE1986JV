package fu.laptopshop.modules.account_catalog.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    private final String configuredSecret;
    private final long accessExpirationMs;
    private SecretKey signingKey;

    public JwtService(
            @Value("${security.jwt.secret:}") String configuredSecret,
            @Value("${security.jwt.access-expiration-ms:900000}") long accessExpirationMs
    ) {
        this.configuredSecret = configuredSecret;
        this.accessExpirationMs = accessExpirationMs;
        if (accessExpirationMs <= 0) {
            throw new IllegalArgumentException("JWT expiry must be positive");
        }
    }

    @PostConstruct
    public void init() {
        byte[] bytes;
        if (configuredSecret == null || configuredSecret.isBlank()) {
            bytes = new byte[32];
            new SecureRandom().nextBytes(bytes);
            logger.warn("JWT_SECRET is not set. Using a random signing key for local demo; all access tokens expire on restart.");
        } else {
            bytes = configuredSecret.getBytes(StandardCharsets.UTF_8);
            if (bytes.length < 32) {
                throw new IllegalArgumentException("JWT_SECRET must contain at least 32 UTF-8 bytes");
            }
        }
        this.signingKey = Keys.hmacShaKeyFor(bytes);
    }

    public String generateAccessToken(UserDetails details) {
        Instant now = Instant.now();
        List<String> roles = details.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(details.getUsername())
                .claim("type", "access")
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(accessExpirationMs)))
                .signWith(signingKey)
                .compact();
    }

    public Claims verifyAccessToken(String token) throws JwtException {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        if (!"access".equals(claims.get("type", String.class))
                || claims.getSubject() == null
                || claims.getSubject().isBlank()) {
            throw new JwtException("Invalid access token type or subject");
        }
        return claims;
    }

    public long getAccessExpirationSeconds() {
        return accessExpirationMs / 1000;
    }

    public long getAccessExpirationMs() {
        return accessExpirationMs;
    }
}
