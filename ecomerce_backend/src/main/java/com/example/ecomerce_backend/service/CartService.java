package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.exception.InsufficientStockException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.request.CartItemRequest;
import com.example.ecomerce_backend.model.dto.response.CartItemResponse;
import com.example.ecomerce_backend.model.dto.response.CartResponse;
import com.example.ecomerce_backend.model.entity.Cart;
import com.example.ecomerce_backend.model.entity.CartItem;
import com.example.ecomerce_backend.model.entity.Inventory;
import com.example.ecomerce_backend.model.entity.Product;
import com.example.ecomerce_backend.model.mapper.CatalogMapper;
import com.example.ecomerce_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final CatalogMapper catalogMapper;

    /**
     * Xem giỏ hàng. Tự dọn các dòng có sản phẩm đã bị ẩn/xóa khỏi catalog.
     */
    @Transactional
    public CartResponse getCart(Long userId) {
        return buildResponse(getOrCreateCart(userId));
    }

    /**
     * Thêm sản phẩm vào giỏ; nếu đã có thì cộng dồn số lượng. Không được vượt tồn kho khả dụng.
     */
    @Transactional
    public CartResponse addItem(Long userId, Long productId, int quantity) {
        Product product = findActiveProduct(productId);
        Cart cart = getOrCreateCart(userId);
        Optional<CartItem> existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        int newQuantity = existing.map(CartItem::getQuantity).orElse(0) + quantity;
        assertWithinStock(product, newQuantity);
        if (existing.isPresent()) {
            existing.get().setQuantity(newQuantity);
        } else {
            cartItemRepository.save(CartItem.builder().cart(cart).product(product).quantity(newQuantity).build());
        }
        return buildResponse(cart);
    }

    /**
     * Đặt số lượng của một dòng trong giỏ về đúng giá trị mới.
     */
    @Transactional
    public CartResponse updateItem(Long userId, Long productId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng"));
        assertWithinStock(findActiveProduct(productId), quantity);
        item.setQuantity(quantity);
        return buildResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng"));
        cartItemRepository.delete(item);
        return buildResponse(cart);
    }

    @Transactional
    public CartResponse clear(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteAll(cartItemRepository.findByCartId(cart.getId()));
        return new CartResponse(List.of(), 0, BigDecimal.ZERO);
    }

    /**
     * Gộp giỏ hàng phía Client vào giỏ trên Backend khi đăng nhập: cộng dồn số lượng, giới hạn theo tồn kho.
     * Sản phẩm đã bị ẩn/xóa hoặc hết hàng sẽ bị bỏ qua thay vì làm cả request thất bại.
     */
    @Transactional
    public CartResponse sync(Long userId, List<CartItemRequest> clientItems) {
        Cart cart = getOrCreateCart(userId);
        // Gộp các dòng trùng productId trong request trước
        Map<Long, Integer> requested = new LinkedHashMap<>();
        for (CartItemRequest item : clientItems) {
            requested.merge(item.productId(), item.quantity(), Integer::sum);
        }
        for (Map.Entry<Long, Integer> entry : requested.entrySet()) {
            Optional<Product> product = productRepository.findActiveById(entry.getKey());
            if (product.isEmpty()) {
                continue;
            }
            int available = availableOf(entry.getKey());
            if (available <= 0) {
                continue;
            }
            Optional<CartItem> existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), entry.getKey());
            int merged = Math.min(existing.map(CartItem::getQuantity).orElse(0) + entry.getValue(), available);
            if (existing.isPresent()) {
                existing.get().setQuantity(merged);
            } else {
                cartItemRepository.save(CartItem.builder().cart(cart).product(product.get()).quantity(merged).build());
            }
        }
        log.info("Đồng bộ giỏ hàng userId={} ({} sản phẩm từ client)", userId, requested.size());
        return buildResponse(cart);
    }

    // ------------------------------------------------------------------ helpers

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() ->
                cartRepository.save(Cart.builder().user(userRepository.getReferenceById(userId)).build()));
    }

    private Product findActiveProduct(Long productId) {
        return productRepository.findActiveById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id=" + productId));
    }

    private int availableOf(Long productId) {
        return inventoryRepository.findByProductId(productId).map(Inventory::availableQuantity).orElse(0);
    }

    private void assertWithinStock(Product product, int quantity) {
        int available = availableOf(product.getId());
        if (quantity > available) {
            throw new InsufficientStockException("Sản phẩm \"" + product.getName() + "\" chỉ còn "
                    + Math.max(available, 0) + " trong kho");
        }
    }

    private CartResponse buildResponse(Cart cart) {
        List<CartItem> items = new ArrayList<>(cartItemRepository.findByCartId(cart.getId()));
        // Dọn các dòng có sản phẩm đã bị ẩn/xóa
        List<CartItem> stale = items.stream()
                .filter(item -> Boolean.TRUE.equals(item.getProduct().getIsDeleted())).toList();
        if (!stale.isEmpty()) {
            cartItemRepository.deleteAll(stale);
            items.removeAll(stale);
        }
        List<Long> productIds = items.stream().map(item -> item.getProduct().getId()).toList();
        Map<Long, Integer> stock = productIds.isEmpty() ? Map.of()
                : inventoryRepository.findByProductIdIn(productIds).stream()
                .collect(Collectors.toMap(i -> i.getProduct().getId(), Inventory::availableQuantity));

        List<CartItemResponse> lines = items.stream().map(item -> {
            Product product = item.getProduct();
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return new CartItemResponse(
                    product.getId(),
                    product.getName(),
                    catalogMapper.thumbnailUrl(product),
                    product.getPrice(),
                    item.getQuantity(),
                    Math.max(stock.getOrDefault(product.getId(), 0), 0),
                    subtotal
            );
        }).toList();
        int totalQuantity = lines.stream().mapToInt(CartItemResponse::quantity).sum();
        BigDecimal totalAmount = lines.stream().map(CartItemResponse::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(lines, totalQuantity, totalAmount);
    }
}