package fu.laptopshop.modules.account_catalog.service;

import fu.laptopshop.modules.account_catalog.dto.BrandResponse;
import fu.laptopshop.modules.account_catalog.dto.CategoryResponse;
import fu.laptopshop.modules.account_catalog.dto.LaptopResponse;

import java.math.BigDecimal;
import java.util.List;

public interface CatalogService {

    List<LaptopResponse> getActiveLaptops(
            String keyword,
            Long brandId,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String priceRange,
            String sortBy
    );

    LaptopResponse getActiveLaptopById(Long id);

    List<BrandResponse> getActiveBrands();

    List<CategoryResponse> getActiveCategories();
}
