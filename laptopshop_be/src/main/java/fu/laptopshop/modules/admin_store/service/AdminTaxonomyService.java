package fu.laptopshop.modules.admin_store.service;

import fu.laptopshop.modules.account_catalog.dto.BrandResponse;
import fu.laptopshop.modules.account_catalog.dto.CategoryResponse;
import fu.laptopshop.modules.admin_store.dto.AdminTaxonomyRequest;

import java.util.List;

public interface AdminTaxonomyService {

    List<BrandResponse> getAllBrands();

    BrandResponse createBrand(AdminTaxonomyRequest request);

    BrandResponse updateBrand(Long id, AdminTaxonomyRequest request);

    List<CategoryResponse> getAllCategories();

    CategoryResponse createCategory(AdminTaxonomyRequest request);

    CategoryResponse updateCategory(Long id, AdminTaxonomyRequest request);
}
