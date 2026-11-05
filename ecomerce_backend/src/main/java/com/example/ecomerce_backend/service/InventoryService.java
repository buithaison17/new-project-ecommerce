package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.exception.InsufficientStockException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.response.InventoryResponse;
import com.example.ecomerce_backend.model.dto.response.PageResponse;
import com.example.ecomerce_backend.model.entity.Inventory;
import com.example.ecomerce_backend.model.mapper.CatalogMapper;
import com.example.ecomerce_backend.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {
    private static final int MAX_PAGE_SIZE = 100;

    private final InventoryRepository inventoryRepository;
    private final CatalogMapper mapper;

    // Ngưỡng cảnh báo hàng sắp hết (SRS: < 5)
    @Value("${app.low-stock-threshold:5}")
    private int lowStockThreshold;

    // ------------------------------------------------------------------ Admin API

    @Transactional(readOnly = true)
    public InventoryResponse getByProductId(Long productId) {
        return mapper.toInventoryResponse(find(productId), lowStockThreshold);
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryResponse> list(boolean lowStockOnly, int page, int size) {
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        Page<Inventory> result = lowStockOnly
                ? inventoryRepository.findLowStock(lowStockThreshold, pageRequest)
                : inventoryRepository.findAllOfActiveProducts(pageRequest);
        return PageResponse.from(result, inventory -> mapper.toInventoryResponse(inventory, lowStockThreshold));
    }

    /** Nhập thêm hàng: cộng dồn vào số lượng hiện có. */
    @Transactional
    public InventoryResponse restock(Long productId, int amount) {
        if (amount <= 0) {
            throw new BadRequestException("Số lượng nhập phải lớn hơn 0");
        }
        Inventory inventory = findForUpdate(productId);
        inventory.setQuantity(inventory.getQuantity() + amount);
        log.info("Nhập kho productId={} +{} => {}", productId, amount, inventory.getQuantity());
        return mapper.toInventoryResponse(inventory, lowStockThreshold);
    }

    /** Điều chỉnh tồn kho về đúng một con số cụ thể (kiểm kê). */
    @Transactional
    public InventoryResponse setQuantity(Long productId, int newQuantity) {
        if (newQuantity < 0) {
            throw new BadRequestException("Số lượng tồn kho không được âm");
        }
        Inventory inventory = findForUpdate(productId);
        if (newQuantity < inventory.getReservedQuantity()) {
            throw new BadRequestException("Số lượng không được nhỏ hơn số đang giữ chỗ ("
                    + inventory.getReservedQuantity() + ")");
        }
        log.info("Điều chỉnh kho productId={} {} => {}", productId, inventory.getQuantity(), newQuantity);
        inventory.setQuantity(newQuantity);
        return mapper.toInventoryResponse(inventory, lowStockThreshold);
    }

    // ------------------------------------------------- Dùng cho Order Engine (Checkout / Hủy đơn)

    /**
     * Trừ kho khi đặt hàng. Khóa dòng tồn kho, kiểm tra lại số lượng khả dụng rồi mới trừ.
     * Gọi bên trong transaction của checkout để toàn bộ đơn hàng được xử lý nguyên tử.
     */
    @Transactional
    public void decreaseStock(Long productId, int amount) {
        if (amount <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }
        Inventory inventory = findForUpdate(productId);
        if (inventory.availableQuantity() < amount) {
            throw new InsufficientStockException("Sản phẩm \"" + inventory.getProduct().getName()
                    + "\" chỉ còn " + inventory.availableQuantity() + " trong kho");
        }
        inventory.setQuantity(inventory.getQuantity() - amount);
        log.info("Trừ kho productId={} -{} => {}", productId, amount, inventory.getQuantity());
    }

    /** Hoàn kho khi hủy đơn (CANCELLED). */
    @Transactional
    public void increaseStock(Long productId, int amount) {
        if (amount <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }
        Inventory inventory = findForUpdate(productId);
        inventory.setQuantity(inventory.getQuantity() + amount);
        log.info("Hoàn kho productId={} +{} => {}", productId, amount, inventory.getQuantity());
    }

    // ------------------------------------------------------------------ helpers

    private Inventory find(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho của sản phẩm id=" + productId));
    }

    private Inventory findForUpdate(Long productId) {
        return inventoryRepository.findByProductIdForUpdate(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho của sản phẩm id=" + productId));
    }
}