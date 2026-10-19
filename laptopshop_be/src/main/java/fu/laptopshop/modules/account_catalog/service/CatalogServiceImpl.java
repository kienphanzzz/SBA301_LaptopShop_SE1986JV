package fu.laptopshop.modules.account_catalog.service;

import fu.laptopshop.common.entity.Brand;
import fu.laptopshop.common.entity.Category;
import fu.laptopshop.common.entity.Laptop;
import fu.laptopshop.common.enums.CommonStatus;
import fu.laptopshop.common.exception.ResourceNotFoundException;
import fu.laptopshop.common.repository.BrandRepository;
import fu.laptopshop.common.repository.CategoryRepository;
import fu.laptopshop.common.repository.LaptopRepository;
import fu.laptopshop.modules.account_catalog.dto.BrandResponse;
import fu.laptopshop.modules.account_catalog.dto.CategoryResponse;
import fu.laptopshop.modules.account_catalog.dto.LaptopResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogServiceImpl implements CatalogService {

    private static final BigDecimal PRICE_20M = new BigDecimal("20000000");
    private static final BigDecimal PRICE_30M = new BigDecimal("30000000");
    private static final BigDecimal ONE_CENT = new BigDecimal("0.01");

    private final LaptopRepository laptopRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<LaptopResponse> getActiveLaptops(
            String keyword,
            Long brandId,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String priceRange,
            String sortBy
    ) {
        if (brandId != null && brandId <= 0) {
            throw new IllegalArgumentException("brandId phải là số nguyên dương.");
        }
        if (categoryId != null && categoryId <= 0) {
            throw new IllegalArgumentException("categoryId phải là số nguyên dương.");
        }
        if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Giá tối thiểu (minPrice) không được âm.");
        }
        if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Giá tối đa (maxPrice) không được âm.");
        }

        String normalizedKeyword = (keyword == null || keyword.trim().isEmpty())
                ? null
                : keyword.trim();

        BigDecimal effectiveMinPrice = minPrice;
        BigDecimal effectiveMaxPrice = maxPrice;

        if (priceRange != null && !priceRange.trim().isEmpty()) {
            switch (priceRange.trim().toLowerCase()) {
                case "low", "under_20m" -> effectiveMaxPrice = PRICE_20M.subtract(ONE_CENT);
                case "middle", "from_20m_to_30m" -> {
                    effectiveMinPrice = PRICE_20M;
                    effectiveMaxPrice = PRICE_30M;
                }
                case "high", "above_30m" -> effectiveMinPrice = PRICE_30M.add(ONE_CENT);
                case "all" -> {
                    // Giữ nguyên minPrice / maxPrice
                }
                default -> throw new IllegalArgumentException("Khoảng giá (priceRange) không hợp lệ: " + priceRange);
            }
        }

        if (effectiveMinPrice != null && effectiveMaxPrice != null
                && effectiveMinPrice.compareTo(effectiveMaxPrice) > 0) {
            throw new IllegalArgumentException("Giá tối thiểu (minPrice) không được lớn hơn giá tối đa (maxPrice).");
        }

        Sort sort = resolveSort(sortBy);

        List<Laptop> laptops = laptopRepository.searchCatalogLaptops(
                CommonStatus.ACTIVE,
                normalizedKeyword,
                brandId,
                categoryId,
                effectiveMinPrice,
                effectiveMaxPrice,
                sort
        );

        return laptops.stream()
                .map(this::mapToLaptopResponse)
                .toList();
    }

    @Override
    public LaptopResponse getActiveLaptopById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("id laptop phải là số nguyên dương.");
        }
        Laptop laptop = laptopRepository.findCatalogLaptopById(id, CommonStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy laptop đang kinh doanh với id = " + id
                ));
        return mapToLaptopResponse(laptop);
    }

    @Override
    public List<BrandResponse> getActiveBrands() {
        return brandRepository.findByStatusOrderByNameAsc(CommonStatus.ACTIVE)
                .stream()
                .map(this::mapToBrandResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByStatusOrderByIdAsc(CommonStatus.ACTIVE)
                .stream()
                .map(this::mapToCategoryResponse)
                .toList();
    }

    private Sort resolveSort(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return Sort.by(Sort.Direction.ASC, "id");
        }
        return switch (sortBy.trim().toLowerCase()) {
            case "default" -> Sort.by(Sort.Direction.ASC, "id");
            case "asc", "price-asc", "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "desc", "price-desc", "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            default -> throw new IllegalArgumentException("Tham số sắp xếp (sortBy) không hợp lệ: " + sortBy);
        };
    }

    private LaptopResponse mapToLaptopResponse(Laptop laptop) {
        int stock = laptop.getStockQuantity() != null ? laptop.getStockQuantity() : 0;
        return LaptopResponse.builder()
                .id(laptop.getId())
                .sku(laptop.getSku())
                .name(laptop.getName())
                .brandId(laptop.getBrand().getId())
                .brandName(laptop.getBrand().getName())
                .categoryId(laptop.getCategory().getId())
                .categoryName(laptop.getCategory().getName())
                .specs(laptop.getSpecs())
                .description(laptop.getDescription())
                .image(laptop.getImage())
                .price(laptop.getPrice())
                .oldPrice(laptop.getOldPrice())
                .stockQuantity(stock)
                .status(laptop.getStatus())
                .inStock(stock > 0 && laptop.getStatus() == CommonStatus.ACTIVE)
                .createdAt(laptop.getCreatedAt())
                .updatedAt(laptop.getUpdatedAt())
                .build();
    }

    private BrandResponse mapToBrandResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .status(brand.getStatus())
                .build();
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .status(category.getStatus())
                .build();
    }
}
