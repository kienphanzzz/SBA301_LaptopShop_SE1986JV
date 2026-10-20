package fu.laptopshop.modules.account_catalog.service;

import fu.laptopshop.modules.account_catalog.dto.LoginRequest;
import fu.laptopshop.modules.account_catalog.dto.RegisterRequest;
import fu.laptopshop.modules.account_catalog.dto.UpdateProfileRequest;
import fu.laptopshop.modules.account_catalog.dto.UserProfileResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AccountService {

    UserProfileResponse registerCustomer(RegisterRequest request);

    UserProfileResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse);

    void logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse);

    UserProfileResponse getProfile(Long authenticatedUserId);

    UserProfileResponse updateProfile(Long authenticatedUserId, UpdateProfileRequest request);
}
