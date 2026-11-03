package com.example.ecomerce_backend.service;

import com.example.ecomerce_backend.exception.BadRequestException;
import com.example.ecomerce_backend.exception.InsufficientStockException;
import com.example.ecomerce_backend.exception.ResourceNotFoundException;
import com.example.ecomerce_backend.model.dto.response.InventoryResponse;
import com.example.ecomerce_backend.model.entity.Inventory;
import com.example.ecomerce_backend.model.entity.Product;
import com.example.ecomerce_backend.model.mapper.CatalogMapper;
import com.example.ecomerce_backend.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {
    private static final Long PRODUCT_ID = 1L;

    @Mock
    private InventoryRepository inventoryRepository;

    private InventoryService inventoryService;

    @BeforeEach
    void setUp() {
        inventoryService = new InventoryService(inventoryRepository, new CatalogMapper());
        ReflectionTestUtils.setField(inventoryService, "lowStockThreshold", 5);
    }

    private Inventory inventory(int quantity, int reserved) {
        Product product = Product.builder().id(PRODUCT_ID).name("Sản phẩm test").build();
        return Inventory.builder().id(10L).product(product).quantity(quantity).reservedQuantity(reserved).build();
    }

    private Inventory givenInventory(int quantity, int reserved) {
        Inventory inventory = inventory(quantity, reserved);
        when(inventoryRepository.findByProductIdForUpdate(PRODUCT_ID)).thenReturn(Optional.of(inventory));
        return inventory;
    }

    @Test
    void restock_addsToExistingQuantity() {
        givenInventory(10, 0);
        InventoryResponse response = inventoryService.restock(PRODUCT_ID, 15);
        assertEquals(25, response.quantity());
        assertFalse(response.lowStock());
    }

    @Test
    void restock_rejectsNonPositiveAmount() {
        assertThrows(BadRequestException.class, () -> inventoryService.restock(PRODUCT_ID, 0));
    }

    @Test
    void restock_unknownProduct_throwsNotFound() {
        when(inventoryRepository.findByProductIdForUpdate(PRODUCT_ID)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> inventoryService.restock(PRODUCT_ID, 5));
    }

    @Test
    void setQuantity_belowReserved_isRejected() {
        givenInventory(10, 4);
        assertThrows(BadRequestException.class, () -> inventoryService.setQuantity(PRODUCT_ID, 3));
    }

    @Test
    void setQuantity_negative_isRejected() {
        assertThrows(BadRequestException.class, () -> inventoryService.setQuantity(PRODUCT_ID, -1));
    }

    @Test
    void setQuantity_flagsLowStockWhenBelowThreshold() {
        givenInventory(10, 0);
        InventoryResponse response = inventoryService.setQuantity(PRODUCT_ID, 4);
        assertEquals(4, response.quantity());
        assertTrue(response.lowStock());
    }

    @Test
    void lowStock_boundary_fiveIsNotLowButFourIs() {
        givenInventory(5, 0);
        assertFalse(inventoryService.setQuantity(PRODUCT_ID, 5).lowStock());
    }

    @Test
    void decreaseStock_subtractsQuantity() {
        Inventory inventory = givenInventory(10, 0);
        inventoryService.decreaseStock(PRODUCT_ID, 4);
        assertEquals(6, inventory.getQuantity());
    }

    @Test
    void decreaseStock_canSellExactlyAllRemaining() {
        Inventory inventory = givenInventory(3, 0);
        inventoryService.decreaseStock(PRODUCT_ID, 3);
        assertEquals(0, inventory.getQuantity());
    }

    @Test
    void decreaseStock_moreThanAvailable_throwsAndKeepsQuantity() {
        Inventory inventory = givenInventory(3, 0);
        assertThrows(InsufficientStockException.class, () -> inventoryService.decreaseStock(PRODUCT_ID, 4));
        assertEquals(3, inventory.getQuantity());
    }

    @Test
    void decreaseStock_respectsReservedQuantity() {
        givenInventory(10, 8);
        assertThrows(InsufficientStockException.class, () -> inventoryService.decreaseStock(PRODUCT_ID, 3));
    }

    @Test
    void increaseStock_restoresQuantityOnCancel() {
        Inventory inventory = givenInventory(2, 0);
        inventoryService.increaseStock(PRODUCT_ID, 5);
        assertEquals(7, inventory.getQuantity());
    }
}
