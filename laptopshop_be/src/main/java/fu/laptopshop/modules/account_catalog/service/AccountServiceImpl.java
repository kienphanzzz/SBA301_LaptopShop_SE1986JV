package fu.laptopshop.modules.account_catalog.service;

import fu.laptopshop.common.entity.User;
import fu.laptopshop.common.enums.CommonStatus;
import fu.laptopshop.common.enums.UserRole;
import fu.laptopshop.common.exception.DuplicateResourceException;
import fu.laptopshop.common.exception.ResourceNotFoundException;
import fu.laptopshop.common.repository.UserRepository;
import fu.laptopshop.config.CustomUserDetails;
import fu.laptopshop.modules.account_catalog.dto.LoginRequest;
import fu.laptopshop.modules.account_catalog.dto.RegisterRequest;
import fu.laptopshop.modules.account_catalog.dto.UpdateProfileRequest;
import fu.laptopshop.modules.account_catalog.dto.UserProfileResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextRepository securityContextRepository;

    @Override
    @Transactional
    public UserProfileResponse registerCustomer(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String fullName = request.getFullName().trim();
        String phone = request.getPhone().trim();

        if (fullName.isEmpty()) {
            throw new IllegalArgumentException("Họ và tên không được để trống.");
        }

        if (request.getConfirmPassword() != null
                && !request.getConfirmPassword().isBlank()
                && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp với mật khẩu đã nhập.");
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("email", "Email này đã được đăng ký sử dụng. Vui lòng dùng email khác.");
        }

        User newUser = User.builder()
                .fullName(fullName)
                .email(normalizedEmail)
                .phone(phone)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CUSTOMER)
                .status(CommonStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(newUser);
        return toProfileResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse login(
            LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Email hoặc mật khẩu không chính xác."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Email hoặc mật khẩu không chính xác.");
        }

        if (user.getStatus() != CommonStatus.ACTIVE) {
            throw new DisabledException("Tài khoản của bạn đang bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ quản trị viên.");
        }

        CustomUserDetails principal = new CustomUserDetails(user);
        UsernamePasswordAuthenticationToken authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal,
                null,
                principal.getAuthorities()
        );

        httpRequest.getSession(true);
        try {
            httpRequest.changeSessionId();
        } catch (IllegalStateException ignored) {
            // MockHttpServletRequest or newly created session without prior ID
        }

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        return toProfileResponse(user);
    }

    @Override
    public void logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
        logoutHandler.setInvalidateHttpSession(true);
        logoutHandler.setClearAuthentication(true);
        logoutHandler.logout(httpRequest, httpResponse, authentication);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long authenticatedUserId) {
        User user = getActiveAuthenticatedUser(authenticatedUserId);
        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long authenticatedUserId, UpdateProfileRequest request) {
        User user = getActiveAuthenticatedUser(authenticatedUserId);

        String fullName = request.getFullName().trim();
        String phone = request.getPhone().trim();
        String address = request.getAddress() != null ? request.getAddress().trim() : null;

        if (fullName.isEmpty()) {
            throw new IllegalArgumentException("Họ và tên không được để trống.");
        }

        user.setFullName(fullName);
        user.setPhone(phone);
        user.setAddress((address == null || address.isEmpty()) ? null : address);

        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    private User getActiveAuthenticatedUser(Long authenticatedUserId) {
        if (authenticatedUserId == null) {
            throw new BadCredentialsException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
        }
        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng."));
        if (user.getStatus() != CommonStatus.ACTIVE) {
            throw new DisabledException("Tài khoản của bạn đang bị khóa hoặc ngừng hoạt động.");
        }
        return user;
    }

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
