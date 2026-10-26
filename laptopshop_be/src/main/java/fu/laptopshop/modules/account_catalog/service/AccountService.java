package fu.laptopshop.modules.account_catalog.service;

import fu.laptopshop.modules.account_catalog.dto.LoginRequest;
import fu.laptopshop.modules.account_catalog.dto.RegisterRequest;
import fu.laptopshop.modules.account_catalog.dto.UpdateProfileRequest;
import fu.laptopshop.modules.account_catalog.dto.UserProfileResponse;

public interface AccountService {

    UserProfileResponse registerCustomer(RegisterRequest request);

    UserProfileResponse authenticateAndGetUser(LoginRequest request);

    UserProfileResponse getProfile(Long authenticatedUserId);

    UserProfileResponse updateProfile(Long authenticatedUserId, UpdateProfileRequest request);
}
