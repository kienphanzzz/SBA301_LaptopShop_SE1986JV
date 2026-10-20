package fu.laptopshop.modules.account_catalog.controller;

import fu.laptopshop.modules.account_catalog.dto.BrandResponse;
import fu.laptopshop.modules.account_catalog.dto.CategoryResponse;
import fu.laptopshop.modules.account_catalog.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaxonomyController {

    private final CatalogService catalogService;

    @GetMapping("/brands")
    public ResponseEntity<List<BrandResponse>> getActiveBrands() {
        return ResponseEntity.ok(catalogService.getActiveBrands());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        return ResponseEntity.ok(catalogService.getActiveCategories());
    }
}
