package fu.laptopshop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    /**
     * Danh sach origins duoc phep, lay tu bien moi truong ALLOWED_ORIGINS.
     * Dev local: http://localhost:5173
     * Production (Vercel): https://your-app.vercel.app
     * Co the truyen nhieu origin cach nhau dau phay:
     *   ALLOWED_ORIGINS=https://app.vercel.app,https://www.yourdomain.com
     */
    @Value("${web.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        // Phan tach chuoi theo dau phay, bo khoang trang thua
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
        corsConfiguration.setAllowedOrigins(origins);

        corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        corsConfiguration.setAllowedHeaders(List.of(
                "Content-Type",
                "Authorization",
                "X-XSRF-TOKEN",
                "X-CSRF-TOKEN",
                "X-Requested-With",
                "Accept",
                "Origin"
        ));
        corsConfiguration.setExposedHeaders(List.of("X-XSRF-TOKEN"));
        // BAT BUOC = true de Cookie hoat dong cross-domain
        corsConfiguration.setAllowCredentials(true);
        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource configurationSource = new UrlBasedCorsConfigurationSource();
        configurationSource.registerCorsConfiguration("/**", corsConfiguration);

        return configurationSource;
    }
}
