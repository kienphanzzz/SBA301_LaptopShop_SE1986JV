package fu.laptopshop.modules.admin_store.controller;

import fu.laptopshop.modules.account_catalog.dto.LaptopResponse;
import fu.laptopshop.modules.admin_store.dto.AdminLaptopRequest;
import fu.laptopshop.modules.admin_store.dto.UpdateStockRequest;
import fu.laptopshop.modules.admin_store.service.AdminLaptopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/laptops")
@RequiredArgsConstructor
public class AdminLaptopController {

    private final AdminLaptopService adminLaptopService;

    @GetMapping
    public ResponseEntity<List<LaptopResponse>> getAllLaptops() {
        return ResponseEntity.ok(adminLaptopService.getAllLaptops());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LaptopResponse> getLaptopById(@PathVariable Long id) {
        return ResponseEntity.ok(adminLaptopService.getLaptopById(id));
    }

    @PostMapping
    public ResponseEntity<LaptopResponse> createLaptop(@Valid @RequestBody AdminLaptopRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminLaptopService.createLaptop(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LaptopResponse> updateLaptop(
            @PathVariable Long id,
            @Valid @RequestBody AdminLaptopRequest request
    ) {
        return ResponseEntity.ok(adminLaptopService.updateLaptop(id, request));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<LaptopResponse> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStockRequest request
    ) {
        return ResponseEntity.ok(adminLaptopService.updateStock(id, request));
    }
}
