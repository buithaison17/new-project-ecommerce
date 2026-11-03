package com.example.ecomerce_backend.config;

import com.example.ecomerce_backend.model.entity.Category;
import com.example.ecomerce_backend.model.entity.Inventory;
import com.example.ecomerce_backend.model.entity.Product;
import com.example.ecomerce_backend.repository.CategoryRepository;
import com.example.ecomerce_backend.repository.InventoryRepository;
import com.example.ecomerce_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Tạo dữ liệu mẫu để team Frontend có thứ để hiển thị khi dev.
 * Chỉ chạy khi chưa có sản phẩm nào; tắt bằng biến môi trường SEED_SAMPLE_DATA=false (nên tắt ở production).
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-sample-data", havingValue = "true")
public class SampleDataInitializer implements CommandLineRunner {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }
        Category phone = categoryRepository.save(Category.builder()
                .name("Điện thoại").description("Điện thoại thông minh").build());
        Category laptop = categoryRepository.save(Category.builder()
                .name("Laptop").description("Máy tính xách tay").build());
        Category accessory = categoryRepository.save(Category.builder()
                .name("Phụ kiện").description("Tai nghe, sạc, ốp lưng...").build());

        createProduct("Điện thoại Galaxy A55", "Màn hình 6.6 inch, RAM 8GB, bộ nhớ 128GB", "9990000", phone, 25);
        createProduct("iPhone 15 128GB", "Chip A16 Bionic, camera 48MP", "19990000", phone, 3);
        createProduct("Laptop Dell Inspiron 15", "Core i5, RAM 16GB, SSD 512GB", "15490000", laptop, 12);
        createProduct("Tai nghe Bluetooth Sony WH-CH520", "Pin 50 giờ, kết nối đa điểm", "1290000", accessory, 0);
        log.info("Đã tạo dữ liệu mẫu: 3 danh mục, 4 sản phẩm");
    }

    private void createProduct(String name, String description, String price, Category category, int quantity) {
        Product product = productRepository.save(Product.builder()
                .name(name)
                .description(description)
                .price(new BigDecimal(price))
                .category(category)
                .build());
        inventoryRepository.save(Inventory.builder()
                .product(product)
                .quantity(quantity)
                .reservedQuantity(0)
                .build());
    }
}
