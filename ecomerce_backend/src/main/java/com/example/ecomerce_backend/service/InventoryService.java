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

    // ------------------------------------------------------------------ Admin API

    @Transactional(readOnly = true)
    public InventoryResponse getByProductId(Long productId) {
        return mapper.toInventoryResponse(find(productId));
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryResponse> list(int page, int size) {
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        Page<Inventory> result = inventoryRepository.findAllOfActiveProducts(pageRequest);
        return PageResponse.from(result, inventory -> mapper.toInventoryResponse(inventory));
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