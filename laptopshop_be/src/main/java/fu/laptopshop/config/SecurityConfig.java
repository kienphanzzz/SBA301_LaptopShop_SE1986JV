package fu.laptopshop.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        http.cors(Customizer.withDefaults())
                .csrf((csrf) -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(requestHandler)
                )
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .securityContext((securityContext) -> securityContext
                        .securityContextRepository(securityContextRepository())
                )
                .exceptionHandling((exceptions) -> exceptions
                        .authenticationEntryPoint((request, response, authException) ->
                                writeJsonError(response, HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện chức năng này.")
                        )
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                writeJsonError(response, HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập hoặc phiên xác thực CSRF không hợp lệ.")
                        )
                )
                .authorizeHttpRequests((authorize) -> authorize
                        // UC-05 & UC-06: Guest và Customer xem danh sách, chi tiết laptop, thương hiệu, danh mục
                        .requestMatchers(HttpMethod.GET, "/api/v1/laptops/**", "/api/v1/brands/**", "/api/v1/categories/**").permitAll()
                        // UC-01 & UC-02: Cho phép lấy CSRF token, Đăng ký Customer và Đăng nhập
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/csrf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login").permitAll()
                        // UC-03 & UC-04: Logout và Profile bắt buộc phải có phiên đăng nhập hợp lệ
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/logout").authenticated()
                        .requestMatchers("/api/v1/profile/**").hasAnyRole("CUSTOMER", "ADMIN")
                        // UC-07 -> UC-12: Wishlist, Cart và Orders dành cho Customer (Admin cũng có thể truy cập nếu cần)
                        .requestMatchers("/api/v1/wishlist/**").hasAnyRole("CUSTOMER", "ADMIN")
                        .requestMatchers("/api/v1/cart/**").hasAnyRole("CUSTOMER", "ADMIN")
                        .requestMatchers("/api/v1/orders/**").hasAnyRole("CUSTOMER", "ADMIN")
                        // UC-13 -> UC-18: Quản trị cửa hàng chỉ dành riêng cho Admin
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    private static void writeJsonError(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String json = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}",
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message.replace("\"", "\\\"")
        );
        response.getWriter().write(json);
    }

    private static final class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(
                HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain
        ) throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null && csrfToken.getToken() != null) {
                response.setHeader(csrfToken.getHeaderName(), csrfToken.getToken());
            }
            filterChain.doFilter(request, response);
        }
    }
}
