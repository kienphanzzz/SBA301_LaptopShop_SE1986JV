package fu.laptopshop.modules.admin_store.controller;

import fu.laptopshop.modules.account_catalog.dto.BrandResponse;
import fu.laptopshop.modules.account_catalog.dto.CategoryResponse;
import fu.laptopshop.modules.admin_store.dto.AdminTaxonomyRequest;
import fu.laptopshop.modules.admin_store.service.AdminTaxonomyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminTaxonomyController {

    private final AdminTaxonomyService adminTaxonomyService;

    @GetMapping("/brands")
    public ResponseEntity<List<BrandResponse>> getAllBrands() {
        return ResponseEntity.ok(adminTaxonomyService.getAllBrands());
    }

    @PostMapping("/brands")
    public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody AdminTaxonomyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminTaxonomyService.createBrand(request));
    }

    @PutMapping("/brands/{id}")
    public ResponseEntity<BrandResponse> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody AdminTaxonomyRequest request
    ) {
        return ResponseEntity.ok(adminTaxonomyService.updateBrand(id, request));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(adminTaxonomyService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody AdminTaxonomyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminTaxonomyService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody AdminTaxonomyRequest request
    ) {
        return ResponseEntity.ok(adminTaxonomyService.updateCategory(id, request));
    }
}
