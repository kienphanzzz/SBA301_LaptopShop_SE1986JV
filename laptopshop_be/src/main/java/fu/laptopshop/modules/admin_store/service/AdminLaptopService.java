package fu.laptopshop.modules.admin_store.service;

import fu.laptopshop.modules.account_catalog.dto.LaptopResponse;
import fu.laptopshop.modules.admin_store.dto.AdminLaptopRequest;
import fu.laptopshop.modules.admin_store.dto.UpdateStockRequest;

import java.util.List;

public interface AdminLaptopService {

    List<LaptopResponse> getAllLaptops();

    LaptopResponse getLaptopById(Long id);

    LaptopResponse createLaptop(AdminLaptopRequest request);

    LaptopResponse updateLaptop(Long id, AdminLaptopRequest request);

    LaptopResponse updateStock(Long id, UpdateStockRequest request);
}
