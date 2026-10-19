package fu.laptopshop.common.repository;

import fu.laptopshop.common.entity.Laptop;
import fu.laptopshop.common.enums.CommonStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface LaptopRepository extends JpaRepository<Laptop, Long> {

    @Query("""
            SELECT l
            FROM Laptop l
            JOIN FETCH l.brand b
            JOIN FETCH l.category c
            WHERE l.status = :status
              AND b.status = :status
              AND c.status = :status
              AND (:brandId IS NULL OR b.id = :brandId)
              AND (:categoryId IS NULL OR c.id = :categoryId)
              AND (:minPrice IS NULL OR l.price >= :minPrice)
              AND (:maxPrice IS NULL OR l.price <= :maxPrice)
              AND (
                   :keyword IS NULL
                   OR LOWER(l.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(l.specs) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR (l.description IS NOT NULL AND LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
                   OR LOWER(l.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            """)
    List<Laptop> searchCatalogLaptops(
            @Param("status") CommonStatus status,
            @Param("keyword") String keyword,
            @Param("brandId") Long brandId,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Sort sort
    );

    @Query("""
            SELECT l
            FROM Laptop l
            JOIN FETCH l.brand b
            JOIN FETCH l.category c
            WHERE l.id = :id
              AND l.status = :status
              AND b.status = :status
              AND c.status = :status
            """)
    Optional<Laptop> findCatalogLaptopById(
            @Param("id") Long id,
            @Param("status") CommonStatus status
    );

    boolean existsBySkuIgnoreCase(String sku);
}
