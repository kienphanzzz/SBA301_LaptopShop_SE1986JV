package fu.laptopshop.common.repository;

import fu.laptopshop.common.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<WishlistItem> findByUserIdAndLaptopId(Long userId, Long laptopId);

    boolean existsByUserIdAndLaptopId(Long userId, Long laptopId);
}
