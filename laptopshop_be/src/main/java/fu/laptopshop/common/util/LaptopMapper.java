package fu.laptopshop.common.util;

import fu.laptopshop.common.entity.Laptop;
import fu.laptopshop.common.enums.CommonStatus;
import fu.laptopshop.modules.account_catalog.dto.LaptopResponse;

public final class LaptopMapper {

    private LaptopMapper() {
    }

    public static LaptopResponse toLaptopResponse(Laptop laptop) {
        if (laptop == null) {
            return null;
        }
        int stock = laptop.getStockQuantity() != null ? laptop.getStockQuantity() : 0;
        return LaptopResponse.builder()
                .id(laptop.getId())
                .sku(laptop.getSku())
                .name(laptop.getName())
                .brandId(laptop.getBrand() != null ? laptop.getBrand().getId() : null)
                .brandName(laptop.getBrand() != null ? laptop.getBrand().getName() : null)
                .categoryId(laptop.getCategory() != null ? laptop.getCategory().getId() : null)
                .categoryName(laptop.getCategory() != null ? laptop.getCategory().getName() : null)
                .specs(laptop.getSpecs())
                .description(cleanDemoPrefix(laptop.getDescription()))
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

    public static String cleanDemoPrefix(String text) {
        if (text == null) {
            return null;
        }
        return text.replaceFirst("^(?i)\\[DEMO\\]\\s*", "").trim();
    }
}
