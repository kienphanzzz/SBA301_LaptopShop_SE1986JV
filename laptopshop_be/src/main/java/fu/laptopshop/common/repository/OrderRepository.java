package fu.laptopshop.common.repository;

import fu.laptopshop.common.entity.Order;
import fu.laptopshop.common.enums.OrderStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :id AND o.user.id = :userId")
    Optional<Order> findWithItemsByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :id")
    Optional<Order> findWithItemsById(@Param("id") Long id);

    @Query("""
            SELECT o
            FROM Order o
            JOIN FETCH o.user u
            WHERE (:status IS NULL OR o.status = :status)
              AND (
                   :keyword IS NULL
                   OR CAST(o.id AS string) LIKE CONCAT('%', :keyword, '%')
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(o.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            """)
    List<Order> searchAdminOrders(
            @Param("status") OrderStatus status,
            @Param("keyword") String keyword,
            Sort sort
    );

    @Query("""
            SELECT o
            FROM Order o
            WHERE o.status = :status
              AND (:startDate IS NULL OR o.orderDate >= :startDate)
              AND (:endDate IS NULL OR o.orderDate <= :endDate)
            ORDER BY o.orderDate DESC
            """)
    List<Order> findOrdersByStatusBetween(
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
