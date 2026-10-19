package fu.laptopshop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults())
                .csrf((csrf) -> csrf.disable())
                .authorizeHttpRequests((authorize) -> authorize
                        // UC-05 & UC-06: Guest và Customer được phép xem danh sách, chi tiết laptop, thương hiệu, danh mục
                        .requestMatchers(HttpMethod.GET, "/api/v1/laptops/**", "/api/v1/brands/**", "/api/v1/categories/**").permitAll()
                        // Các API khác (như Profile, Wishlist, Cart, Order, Admin) bắt buộc phải xác thực, KHÔNG mở permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
