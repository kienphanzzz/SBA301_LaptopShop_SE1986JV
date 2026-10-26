package fu.laptopshop.modules.admin_store.service;

import fu.laptopshop.common.entity.Brand;
import fu.laptopshop.common.entity.Category;
import fu.laptopshop.common.enums.CommonStatus;
import fu.laptopshop.common.exception.DuplicateResourceException;
import fu.laptopshop.common.exception.ResourceNotFoundException;
import fu.laptopshop.common.repository.BrandRepository;
import fu.laptopshop.common.repository.CategoryRepository;
import fu.laptopshop.common.util.LaptopMapper;
import fu.laptopshop.modules.account_catalog.dto.BrandResponse;
import fu.laptopshop.modules.account_catalog.dto.CategoryResponse;
import fu.laptopshop.modules.admin_store.dto.AdminTaxonomyRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminTaxonomyServiceImpl implements AdminTaxonomyService {

    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(this::mapToBrandResponse)
                .toList();
    }

    @Override
    @Transactional
    public BrandResponse createBrand(AdminTaxonomyRequest request) {
        String name = request.getName().trim();
        if (brandRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("name", "Thương hiệu '" + name + "' đã tồn tại.");
        }

        Brand brand = Brand.builder()
                .name(name)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .status(request.getStatus() != null ? request.getStatus() : CommonStatus.ACTIVE)
                .build();

        return mapToBrandResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(Long id, AdminTaxonomyRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thương hiệu không tồn tại với mã #" + id));

        String name = request.getName().trim();
        if (brandRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("name", "Tên thương hiệu '" + name + "' đã được sử dụng.");
        }

        brand.setName(name);
        if (request.getDescription() != null) {
            brand.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            brand.setStatus(request.getStatus());
        }

        return mapToBrandResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(this::mapToCategoryResponse)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(AdminTaxonomyRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("name", "Danh mục '" + name + "' đã tồn tại.");
        }

        Category category = Category.builder()
                .name(name)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .status(request.getStatus() != null ? request.getStatus() : CommonStatus.ACTIVE)
                .build();

        return mapToCategoryResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, AdminTaxonomyRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại với mã #" + id));

        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("name", "Tên danh mục '" + name + "' đã được sử dụng.");
        }

        category.setName(name);
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }

        return mapToCategoryResponse(categoryRepository.save(category));
    }

    private BrandResponse mapToBrandResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(LaptopMapper.cleanDemoPrefix(brand.getDescription()))
                .status(brand.getStatus())
                .build();
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(LaptopMapper.cleanDemoPrefix(category.getDescription()))
                .status(category.getStatus())
                .build();
    }
}
