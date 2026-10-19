package fu.laptopshop.modules.account_catalog.controller;

import fu.laptopshop.modules.account_catalog.dto.LaptopResponse;
import fu.laptopshop.modules.account_catalog.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/laptops")
@RequiredArgsConstructor
public class LaptopController {

    private final CatalogService catalogService;

    /**
     * UC-05: Browse and Search Laptops.
     * Chỉ trả về các laptop có status = ACTIVE (BR-07, BR-09).
     */
    @GetMapping
    public ResponseEntity<List<LaptopResponse>> getLaptops(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String priceRange,
            @RequestParam(required = false, defaultValue = "default") String sortBy
    ) {
        List<LaptopResponse> laptops = catalogService.getActiveLaptops(
                keyword,
                brandId,
                categoryId,
                minPrice,
                maxPrice,
                priceRange,
                sortBy
        );
        return ResponseEntity.ok(laptops);
    }

    /**
     * UC-06: View Laptop Details.
     * Trả về thông tin chi tiết laptop ACTIVE hoặc 404 nếu không tồn tại / INACTIVE.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LaptopResponse> getLaptopById(@PathVariable Long id) {
        return ResponseEntity.ok(catalogService.getActiveLaptopById(id));
    }
}
