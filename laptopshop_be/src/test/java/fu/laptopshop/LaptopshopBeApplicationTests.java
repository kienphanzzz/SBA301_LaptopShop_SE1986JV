package fu.laptopshop;

import fu.laptopshop.common.entity.Laptop;
import fu.laptopshop.common.entity.User;
import fu.laptopshop.common.enums.CommonStatus;
import fu.laptopshop.common.enums.UserRole;
import fu.laptopshop.common.exception.ResourceNotFoundException;
import fu.laptopshop.common.repository.BrandRepository;
import fu.laptopshop.common.repository.CartItemRepository;
import fu.laptopshop.common.repository.CategoryRepository;
import fu.laptopshop.common.repository.LaptopRepository;
import fu.laptopshop.common.repository.OrderItemRepository;
import fu.laptopshop.common.repository.OrderRepository;
import fu.laptopshop.common.repository.UserRepository;
import fu.laptopshop.common.repository.WishlistItemRepository;
import fu.laptopshop.modules.account_catalog.controller.LaptopController;
import fu.laptopshop.modules.account_catalog.controller.TaxonomyController;
import fu.laptopshop.modules.account_catalog.dto.BrandResponse;
import fu.laptopshop.modules.account_catalog.dto.CategoryResponse;
import fu.laptopshop.modules.account_catalog.dto.LaptopResponse;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LaptopshopBeApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private LaptopRepository laptopRepository;

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private LaptopController laptopController;

    @Autowired
    private TaxonomyController taxonomyController;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void contextLoadsAndValidateAll8Tables() {
        assertTrue(userRepository.count() >= 2);
        assertTrue(brandRepository.count() >= 6);
        assertTrue(categoryRepository.count() >= 4);
        assertTrue(laptopRepository.count() >= 8);
        assertTrue(wishlistItemRepository.count() >= 1);
        assertTrue(cartItemRepository.count() >= 0);
        assertTrue(orderRepository.count() >= 3);
        assertTrue(orderItemRepository.count() >= 3);
    }

    @Test
    void testGetActiveLaptopsAndFilters() {
        ResponseEntity<List<LaptopResponse>> allResp = laptopController.getLaptops(
                null, null, null, null, null, null, "default"
        );
        assertNotNull(allResp.getBody());
        assertEquals(8, allResp.getBody().size());

        ResponseEntity<List<LaptopResponse>> keywordResp = laptopController.getLaptops(
                "Vivobook", null, null, null, null, null, "default"
        );
        assertNotNull(keywordResp.getBody());
        assertFalse(keywordResp.getBody().isEmpty());
        assertTrue(keywordResp.getBody().stream().anyMatch(l -> l.getName().contains("Vivobook")));

        // ASUS (brandId = 1), Văn phòng - học tập (categoryId = 1), 10M - 20M -> ASUS Vivobook 15 OLED
        ResponseEntity<List<LaptopResponse>> filterResp = laptopController.getLaptops(
                null, 1L, 1L, new BigDecimal("10000000"), new BigDecimal("20000000"), null, "price-asc"
        );
        assertNotNull(filterResp.getBody());
        assertEquals(1, filterResp.getBody().size());
        assertEquals("ASUS", filterResp.getBody().getFirst().getBrandName());
    }

    @Test
    @Transactional
    void testInactiveLaptopHiddenInListAndDetail() throws Exception {
        Laptop laptop1 = laptopRepository.findById(1L).orElseThrow();
        laptop1.setStatus(CommonStatus.INACTIVE);
        laptopRepository.saveAndFlush(laptop1);

        // 1. INACTIVE laptop must not appear in GET /api/v1/laptops (7 active left)
        mockMvc.perform(get("/api/v1/laptops"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(7));

        // 2. GET /api/v1/laptops/1 must return 404 Not Found when INACTIVE
        mockMvc.perform(get("/api/v1/laptops/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
        // @Transactional rolls back automatically so LaptopShopDB remains unchanged
    }

    @Test
    void testFrontendSortAndPriceRangeAndInvalidFilters() throws Exception {
        // 1. Sort asc (frontend value 'asc'): lowest price first (16,490,000 - ASU-VB-001)
        mockMvc.perform(get("/api/v1/laptops").param("sortBy", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("ASU-VB-001"))
                .andExpect(jsonPath("$[7].sku").value("DEL-XPS-008"));

        // 2. Sort desc (frontend value 'desc'): highest price first (32,990,000 - DEL-XPS-008)
        mockMvc.perform(get("/api/v1/laptops").param("sortBy", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("DEL-XPS-008"))
                .andExpect(jsonPath("$[7].sku").value("ASU-VB-001"));

        // 3. Frontend priceRange='low' (< 20M -> 4 laptops: id 1, 3, 4, 7)
        mockMvc.perform(get("/api/v1/laptops").param("priceRange", "low"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4));

        // 4. Frontend priceRange='middle' (20M..30M -> 3 laptops: id 2, 5, 6)
        mockMvc.perform(get("/api/v1/laptops").param("priceRange", "middle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));

        // 5. Frontend priceRange='high' (> 30M -> 1 laptop: id 8)
        mockMvc.perform(get("/api/v1/laptops").param("priceRange", "high"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].sku").value("DEL-XPS-008"));

        // 6. Invalid filter: minPrice > maxPrice -> 400 Bad Request
        mockMvc.perform(get("/api/v1/laptops")
                        .param("minPrice", "30000000")
                        .param("maxPrice", "10000000"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        // 7. Invalid filter: unknown priceRange -> 400 Bad Request
        mockMvc.perform(get("/api/v1/laptops").param("priceRange", "invalid_range"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        // 8. Invalid filter: unknown sortBy -> 400 Bad Request
        mockMvc.perform(get("/api/v1/laptops").param("sortBy", "invalid_sort"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        // 9. Invalid parameter type: brandId=abc -> 400 Bad Request
        mockMvc.perform(get("/api/v1/laptops").param("brandId", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void testGetLaptopByIdAndNotFound() {
        ResponseEntity<LaptopResponse> detailResp = laptopController.getLaptopById(1L);
        assertNotNull(detailResp.getBody());
        assertEquals(1L, detailResp.getBody().getId());
        assertEquals("ASU-VB-001", detailResp.getBody().getSku());
        assertEquals("ASUS", detailResp.getBody().getBrandName());
        assertEquals("Văn phòng - học tập", detailResp.getBody().getCategoryName());
        assertNotNull(detailResp.getBody().getDescription());
        assertFalse(detailResp.getBody().getDescription().startsWith("[DEMO]"));

        // Laptop #3 has oldPrice = NULL
        ResponseEntity<LaptopResponse> laptop3 = laptopController.getLaptopById(3L);
        assertNotNull(laptop3.getBody());
        assertNull(laptop3.getBody().getOldPrice());

        // Laptop #7 has stockQuantity = 0 -> inStock = false
        ResponseEntity<LaptopResponse> laptop7 = laptopController.getLaptopById(7L);
        assertNotNull(laptop7.getBody());
        assertEquals(0, laptop7.getBody().getStockQuantity());
        assertFalse(laptop7.getBody().isInStock());

        assertThrows(ResourceNotFoundException.class, () -> laptopController.getLaptopById(99999L));
    }

    @Test
    void testGetBrandsAndCategories() {
        ResponseEntity<List<BrandResponse>> brands = taxonomyController.getActiveBrands();
        assertNotNull(brands.getBody());
        assertEquals(6, brands.getBody().size());
        assertTrue(brands.getBody().stream().noneMatch(b -> b.getDescription() != null && b.getDescription().startsWith("[DEMO]")));

        ResponseEntity<List<CategoryResponse>> categories = taxonomyController.getActiveCategories();
        assertNotNull(categories.getBody());
        assertEquals(4, categories.getBody().size());
        assertTrue(categories.getBody().stream().noneMatch(c -> c.getDescription() != null && c.getDescription().startsWith("[DEMO]")));
    }

    @Test
    void testRestApiHttpEndpoints() throws Exception {
        // 1. GET /api/v1/laptops (all active)
        mockMvc.perform(get("/api/v1/laptops"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));

        // 2. GET /api/v1/laptops?keyword=MacBook
        mockMvc.perform(get("/api/v1/laptops").param("keyword", "MacBook"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].brandName").value("Apple"));

        // 3. GET /api/v1/laptops?categoryId=2&priceRange=FROM_20M_TO_30M (Lenovo LOQ 15 & Acer Nitro V 15)
        mockMvc.perform(get("/api/v1/laptops")
                        .param("categoryId", "2")
                        .param("priceRange", "FROM_20M_TO_30M"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        // 4. GET /api/v1/laptops/1 (existing ID)
        mockMvc.perform(get("/api/v1/laptops/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("ASU-VB-001"))
                .andExpect(jsonPath("$.brandName").value("ASUS"))
                .andExpect(jsonPath("$.categoryName").value("Văn phòng - học tập"))
                .andExpect(jsonPath("$.inStock").value(true));

        // 5. GET /api/v1/laptops/99999 (non-existent ID -> 404 Not Found)
        mockMvc.perform(get("/api/v1/laptops/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        // 6. Protected endpoint /api/v1/profile must NOT be permitAll() -> 401
        mockMvc.perform(get("/api/v1/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Transactional
    void testUc01RegisterCustomerValidationAndSecurity() throws Exception {
        String registerPayload = """
                {
                  "fullName": "Nguyễn Văn Test",
                  "email": "NewCustomer@LaptopHub.vn",
                  "phone": "0912345678",
                  "password": "Password123",
                  "confirmPassword": "Password123",
                  "role": "ADMIN",
                  "status": "INACTIVE"
                }
                """;

        // 1. Missing CSRF token on POST -> 403 Forbidden
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isForbidden());

        // 2. Valid registration -> 201 Created, role forced to CUSTOMER, status ACTIVE, no passwordHash
        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName").value("Nguyễn Văn Test"))
                .andExpect(jsonPath("$.email").value("newcustomer@laptophub.vn"))
                .andExpect(jsonPath("$.phone").value("0912345678"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist());

        // Verify BCrypt hash stored in DB (not plaintext)
        User saved = userRepository.findByEmailIgnoreCase("newcustomer@laptophub.vn").orElseThrow();
        assertNotEquals("Password123", saved.getPasswordHash());
        assertTrue(passwordEncoder.matches("Password123", saved.getPasswordHash()));
        assertEquals(UserRole.CUSTOMER, saved.getRole());
        assertEquals(CommonStatus.ACTIVE, saved.getStatus());

        // 3. Duplicate email (case-insensitive) -> 409 Conflict
        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Người Thứ Hai",
                                  "email": "NEWCUSTOMER@LAPTOPHUB.VN",
                                  "phone": "0988776655",
                                  "password": "Password123"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.fieldErrors.email").exists());

        // 4. Invalid email format -> 400 Bad Request
        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Nguyễn Văn B",
                                  "email": "not-an-email",
                                  "phone": "0988776655",
                                  "password": "Password123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists());

        // 5. Short password (< 6 chars) and missing required fields -> 400 Bad Request
        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "",
                                  "email": "valid@laptophub.vn",
                                  "phone": "123",
                                  "password": "123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.fullName").exists())
                .andExpect(jsonPath("$.fieldErrors.phone").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    @Transactional
    void testUc02LoginAndUc03LogoutFlow() throws Exception {
        // Register a customer first
        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Trần Thị Khách",
                                  "email": "khachlogin@laptophub.vn",
                                  "phone": "0905112233",
                                  "password": "Secret123"
                                }
                                """))
                .andExpect(status().isCreated());

        // 1. Login with wrong password -> 401 Unauthorized
        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "khachlogin@laptophub.vn",
                                  "password": "WrongPassword"
                                }
                                """))
                .andExpect(status().isUnauthorized());

        // 2. Login with non-existent email -> 401 Unauthorized
        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "nobody@laptophub.vn",
                                  "password": "Secret123"
                                }
                                """))
                .andExpect(status().isUnauthorized());

        // 3. Valid Login -> 200 OK, returns CUSTOMER role, creates authenticated session
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "khachlogin@laptophub.vn",
                                  "password": "Secret123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("khachlogin@laptophub.vn"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andReturn();

        HttpSession session = loginResult.getRequest().getSession(false);
        assertNotNull(session);
        MockHttpSession authSession = (MockHttpSession) session;

        // 4. Authenticated session can access GET /api/v1/profile
        mockMvc.perform(get("/api/v1/profile").session(authSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("khachlogin@laptophub.vn"));

        // 5. UC-03 Logout invalidates session
        mockMvc.perform(post("/api/v1/auth/logout")
                        .with(csrf())
                        .session(authSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        // 6. Using old session after logout -> 401 Unauthorized
        mockMvc.perform(get("/api/v1/profile").session(authSession))
                .andExpect(status().isUnauthorized());

        // 7. INACTIVE user login -> 403 Forbidden
        User user = userRepository.findByEmailIgnoreCase("khachlogin@laptophub.vn").orElseThrow();
        user.setStatus(CommonStatus.INACTIVE);
        userRepository.saveAndFlush(user);

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "khachlogin@laptophub.vn",
                                  "password": "Secret123"
                                }
                                """))
                .andExpect(status().isForbidden());

        // 8. ADMIN user login -> returns role ADMIN from DB
        User adminUser = User.builder()
                .fullName("Quản Trị Hệ Thống")
                .email("admintest@laptophub.vn")
                .phone("0909999999")
                .passwordHash(passwordEncoder.encode("AdminPass123"))
                .role(UserRole.ADMIN)
                .status(CommonStatus.ACTIVE)
                .build();
        userRepository.saveAndFlush(adminUser);

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "admintest@laptophub.vn",
                                  "password": "AdminPass123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @Transactional
    void testUc04ProfileUpdateAndAuthorization() throws Exception {
        // 1. Guest cannot GET or PUT /api/v1/profile
        mockMvc.perform(get("/api/v1/profile"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/v1/profile")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Guest Hack",
                                  "phone": "0912345678",
                                  "address": "Hà Nội"
                                }
                                """))
                .andExpect(status().isUnauthorized());

        // 2. Register User A and User B
        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "User A",
                                  "email": "usera@laptophub.vn",
                                  "phone": "0911111111",
                                  "password": "Password123"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "User B",
                                  "email": "userb@laptophub.vn",
                                  "phone": "0922222222",
                                  "password": "Password123"
                                }
                                """))
                .andExpect(status().isCreated());

        User userBBefore = userRepository.findByEmailIgnoreCase("userb@laptophub.vn").orElseThrow();

        // 3. Login as User A
        MvcResult loginA = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "usera@laptophub.vn",
                                  "password": "Password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession sessionA = (MockHttpSession) loginA.getRequest().getSession(false);
        assertNotNull(sessionA);

        // 4. User A updates profile and attempts to tamper with id, email, role, status
        mockMvc.perform(put("/api/v1/profile")
                        .with(csrf())
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {
                                  "id": %d,
                                  "fullName": "User A Đã Cập Nhật",
                                  "email": "hacked@laptophub.vn",
                                  "phone": "0933445566",
                                  "address": "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
                                  "role": "ADMIN",
                                  "status": "INACTIVE"
                                }
                                """, userBBefore.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("User A Đã Cập Nhật"))
                .andExpect(jsonPath("$.phone").value("0933445566"))
                .andExpect(jsonPath("$.address").value("123 Nguyễn Văn Cừ, Quận 5, TP.HCM"))
                .andExpect(jsonPath("$.email").value("usera@laptophub.vn"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // 5. Verify User B was NOT modified at all
        User userBAfter = userRepository.findById(userBBefore.getId()).orElseThrow();
        assertEquals("User B", userBAfter.getFullName());
        assertEquals("0922222222", userBAfter.getPhone());
        assertNull(userBAfter.getAddress());
    }

    @Test
    @Transactional
    void testUC07WishlistLifecycle() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "khach@laptophub.demo",
                                  "password": "Password123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        assertNotNull(session);

        // 1. Get wishlist
        mockMvc.perform(get("/api/v1/wishlist").session(session))
                .andExpect(status().isOk());

        // 2. Toggle wishlist
        mockMvc.perform(post("/api/v1/wishlist/1/toggle")
                        .with(csrf())
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.laptopId").value(1));

        // 3. Get wishlist ids
        mockMvc.perform(get("/api/v1/wishlist/ids").session(session))
                .andExpect(status().isOk());
    }

    @Test
    @Transactional
    void testUC08CartOperations() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "khach@laptophub.demo",
                                  "password": "Password123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        assertNotNull(session);

        // 1. Add to cart
        mockMvc.perform(post("/api/v1/cart")
                        .with(csrf())
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "laptopId": 1,
                                  "quantity": 2
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.laptopId").value(1))
                .andExpect(jsonPath("$.quantity").value(2));

        // 2. Get cart
        mockMvc.perform(get("/api/v1/cart").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalQuantity").value(2));

        // 3. Update quantity
        mockMvc.perform(put("/api/v1/cart/1")
                        .with(csrf())
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "quantity": 3
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(3));

        // 4. Remove from cart
        mockMvc.perform(delete("/api/v1/cart/1")
                        .with(csrf())
                        .session(session))
                .andExpect(status().isNoContent());
    }

    @Test
    @Transactional
    void testUC09ToUC12OrderLifecycleAndRestock() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "khach@laptophub.demo",
                                  "password": "Password123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        assertNotNull(session);

        Laptop laptop = laptopRepository.findById(1L).orElseThrow();
        int initialStock = laptop.getStockQuantity();

        // 1. Add item to cart
        mockMvc.perform(post("/api/v1/cart")
                        .with(csrf())
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "laptopId": 1,
                                  "quantity": 2
                                }
                                """))
                .andExpect(status().isCreated());

        // 2. Place Order COD
        MvcResult orderResult = mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "receiverName": "Nguyễn Văn Giang",
                                  "phone": "0912345678",
                                  "address": "Số 1 Cầu Giấy, Hà Nội"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.items.length()").value(1))
                .andReturn();

        // Verify stock deducted
        Laptop laptopAfterOrder = laptopRepository.findById(1L).orElseThrow();
        assertEquals(initialStock - 2, laptopAfterOrder.getStockQuantity());

        // Extract order ID
        String responseBody = orderResult.getResponse().getContentAsString();
        long orderId = ((Number) org.springframework.boot.json.JsonParserFactory.getJsonParser().parseMap(responseBody).get("id")).longValue();

        // 3. View my orders
        mockMvc.perform(get("/api/v1/orders/me").session(session))
                .andExpect(status().isOk());

        // 4. View order detail
        mockMvc.perform(get("/api/v1/orders/me/" + orderId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId));

        // 5. Cancel PENDING order -> must refund stock
        mockMvc.perform(post("/api/v1/orders/me/" + orderId + "/cancel")
                        .with(csrf())
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        // Verify stock refunded
        Laptop laptopAfterCancel = laptopRepository.findById(1L).orElseThrow();
        assertEquals(initialStock, laptopAfterCancel.getStockQuantity());
    }

    @Test
    @Transactional
    void testUC13ToUC18AdminStoreManagement() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "admin@laptophub.demo",
                                  "password": "Password123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        assertNotNull(session);

        // 1. Admin gets all laptops
        mockMvc.perform(get("/api/v1/admin/laptops").session(session))
                .andExpect(status().isOk());

        // 2. Admin updates stock (UC-15)
        mockMvc.perform(patch("/api/v1/admin/laptops/1/stock")
                        .with(csrf())
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "stockQuantity": 25
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockQuantity").value(25));

        // 3. Admin gets all orders (UC-16)
        mockMvc.perform(get("/api/v1/admin/orders").session(session))
                .andExpect(status().isOk());

        // 4. Admin advances order status PENDING -> CONFIRMED (UC-17)
        mockMvc.perform(patch("/api/v1/admin/orders/1001/status")
                        .with(csrf())
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "CONFIRMED"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        // 5. Admin views sales report (UC-18)
        mockMvc.perform(get("/api/v1/admin/reports/sales")
                        .param("fromDate", "2026-01-01")
                        .param("toDate", "2026-12-31")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedOrderCount").isNumber())
                .andExpect(jsonPath("$.totalRevenue").isNumber());
    }
}
