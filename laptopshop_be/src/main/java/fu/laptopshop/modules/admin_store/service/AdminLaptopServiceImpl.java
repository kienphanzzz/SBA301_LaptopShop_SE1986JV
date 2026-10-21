package fu.laptopshop.modules.admin_store.service;

import fu.laptopshop.common.entity.Brand;
import fu.laptopshop.common.entity.Category;
import fu.laptopshop.common.entity.Laptop;
import fu.laptopshop.common.exception.DuplicateResourceException;
import fu.laptopshop.common.exception.ResourceNotFoundException;
import fu.laptopshop.common.repository.BrandRepository;
import fu.laptopshop.common.repository.CategoryRepository;
import fu.laptopshop.common.repository.LaptopRepository;
import fu.laptopshop.common.util.LaptopMapper;
import fu.laptopshop.modules.account_catalog.dto.LaptopResponse;
import fu.laptopshop.modules.admin_store.dto.AdminLaptopRequest;
import fu.laptopshop.modules.admin_store.dto.UpdateStockRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminLaptopServiceImpl implements AdminLaptopService {

    private final LaptopRepository laptopRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LaptopResponse> getAllLaptops() {
        return laptopRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(LaptopMapper::toLaptopResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LaptopResponse getLaptopById(Long id) {
        Laptop laptop = laptopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laptop không tồn tại với mã #" + id));
        return LaptopMapper.toLaptopResponse(laptop);
    }

    @Override
    @Transactional
    public LaptopResponse createLaptop(AdminLaptopRequest request) {
        String sku = request.getSku().trim().toUpperCase();
        if (laptopRepository.existsBySkuIgnoreCase(sku)) {
            throw new DuplicateResourceException("sku", "Mã SKU '" + sku + "' đã tồn tại.");
        }

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Thương hiệu không tồn tại với mã #" + request.getBrandId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại với mã #" + request.getCategoryId()));

        Laptop laptop = Laptop.builder()
                .sku(sku)
                .name(request.getName().trim())
                .brand(brand)
                .category(category)
                .price(request.getPrice())
                .oldPrice(request.getOldPrice())
                .stockQuantity(request.getStockQuantity())
                .status(request.getStatus())
                .image(request.getImage() != null && !request.getImage().isBlank() ? request.getImage().trim() : "/assets/laptop-silver.svg")
                .specs(request.getSpecs() != null ? request.getSpecs().trim() : null)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .build();

        Laptop saved = laptopRepository.save(laptop);
        return LaptopMapper.toLaptopResponse(saved);
    }

    @Override
    @Transactional
    public LaptopResponse updateLaptop(Long id, AdminLaptopRequest request) {
        Laptop laptop = laptopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laptop không tồn tại với mã #" + id));

        String sku = request.getSku().trim().toUpperCase();
        if (laptopRepository.existsBySkuIgnoreCaseAndIdNot(sku, id)) {
            throw new DuplicateResourceException("sku", "Mã SKU '" + sku + "' đã được sử dụng bởi laptop khác.");
        }

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Thương hiệu không tồn tại với mã #" + request.getBrandId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại với mã #" + request.getCategoryId()));

        laptop.setSku(sku);
        laptop.setName(request.getName().trim());
        laptop.setBrand(brand);
        laptop.setCategory(category);
        laptop.setPrice(request.getPrice());
        laptop.setOldPrice(request.getOldPrice());
        laptop.setStockQuantity(request.getStockQuantity());
        laptop.setStatus(request.getStatus());
        if (request.getImage() != null && !request.getImage().isBlank()) {
            laptop.setImage(request.getImage().trim());
        }
        laptop.setSpecs(request.getSpecs() != null ? request.getSpecs().trim() : null);
        laptop.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        Laptop saved = laptopRepository.save(laptop);
        return LaptopMapper.toLaptopResponse(saved);
    }

    @Override
    @Transactional
    public LaptopResponse updateStock(Long id, UpdateStockRequest request) {
        Laptop laptop = laptopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laptop không tồn tại với mã #" + id));

        laptop.setStockQuantity(request.getStockQuantity());
        Laptop saved = laptopRepository.save(laptop);
        return LaptopMapper.toLaptopResponse(saved);
    }
}
