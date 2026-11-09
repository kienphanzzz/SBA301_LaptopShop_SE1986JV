package fu.laptopshop.modules.shopping_order.service;

import fu.laptopshop.common.entity.Laptop;
import fu.laptopshop.common.entity.User;
import fu.laptopshop.common.entity.WishlistItem;
import fu.laptopshop.common.exception.ResourceNotFoundException;
import fu.laptopshop.common.repository.LaptopRepository;
import fu.laptopshop.common.repository.UserRepository;
import fu.laptopshop.common.repository.WishlistItemRepository;
import fu.laptopshop.common.util.LaptopMapper;
import fu.laptopshop.modules.shopping_order.dto.WishlistItemResponse;
import fu.laptopshop.modules.shopping_order.dto.WishlistToggleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final LaptopRepository laptopRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getWishlist(Long userId) {
        List<WishlistItem> items = wishlistItemRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<WishlistItemResponse> responseList = new ArrayList<>();

        for (WishlistItem item : items) {
            responseList.add(mapToResponse(item));
        }

        return responseList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getWishlistLaptopIds(Long userId) {
        List<WishlistItem> items = wishlistItemRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Long> idList = new ArrayList<>();

        for (WishlistItem item : items) {
            idList.add(item.getLaptop().getId());
        }

        return idList;
    }

    @Override
    @Transactional
    public WishlistToggleResponse toggleWishlist(Long userId, Long laptopId) {
        Optional<WishlistItem> existing = wishlistItemRepository.findByUserIdAndLaptopId(userId, laptopId);

        if (existing.isPresent()) {
            wishlistItemRepository.delete(existing.get());
            return WishlistToggleResponse.builder()
                    .laptopId(laptopId)
                    .added(false)
                    .message("Đã bỏ sản phẩm khỏi wishlist.")
                    .build();
        }

        Laptop laptop = laptopRepository.findById(laptopId)
                .orElseThrow(() -> new ResourceNotFoundException("Laptop không tồn tại với mã #" + laptopId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại."));

        WishlistItem newItem = WishlistItem.builder()
                .user(user)
                .laptop(laptop)
                .build();
        wishlistItemRepository.save(newItem);

        return WishlistToggleResponse.builder()
                .laptopId(laptopId)
                .added(true)
                .message("Đã thêm sản phẩm vào wishlist.")
                .build();
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long userId, Long laptopId) {
        Optional<WishlistItem> existing = wishlistItemRepository.findByUserIdAndLaptopId(userId, laptopId);
        if (existing.isPresent()) {
            wishlistItemRepository.delete(existing.get());
        }
    }

    private WishlistItemResponse mapToResponse(WishlistItem item) {
        return WishlistItemResponse.builder()
                .id(item.getId())
                .laptopId(item.getLaptop().getId())
                .laptop(LaptopMapper.toLaptopResponse(item.getLaptop()))
                .createdAt(item.getCreatedAt())
                .build();
    }
}
