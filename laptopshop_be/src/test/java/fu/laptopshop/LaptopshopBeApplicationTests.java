package fu.laptopshop;

import fu.laptopshop.common.entity.Laptop;
import fu.laptopshop.common.enums.CommonStatus;
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
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

        ResponseEntity<List<CategoryResponse>> categories = taxonomyController.getActiveCategories();
        assertNotNull(categories.getBody());
        assertEquals(4, categories.getBody().size());
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

        // 6. Protected endpoint /api/v1/profile must NOT be permitAll() -> 401/403
        mockMvc.perform(get("/api/v1/profile"))
                .andExpect(status().is4xxClientError());
    }
}
