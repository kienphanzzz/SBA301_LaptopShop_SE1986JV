package fu.laptopshop.common.repository;

import fu.laptopshop.common.entity.Brand;
import fu.laptopshop.common.enums.CommonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {

    List<Brand> findByStatusOrderByNameAsc(CommonStatus status);

    Optional<Brand> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
