package com.example.ecomerce_backend.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FlashSaleRequest(
        @NotBlank(message = "Tên chương trình không được để trống")
        @Size(max = 255, message = "Tên chương trình tối đa 255 ký tự")
        String name,
        @Size(max = 1000, message = "Mô tả tối đa 1000 ký tự")
        String description,
        @NotBlank(message = "Phạm vi áp dụng không được để trống")
        @Pattern(regexp = "^(ALL|CATEGORY|PRODUCT)$", message = "Phạm vi chỉ hỗ trợ ALL, CATEGORY hoặc PRODUCT")
        String scope,
        Long categoryId,
        Long productId,
        @NotBlank(message = "Loại giảm giá không được để trống")
        @Pattern(regexp = "^(PERCENTAGE|FIXED_AMOUNT)$", message = "Loại giảm giá chỉ hỗ trợ PERCENTAGE hoặc FIXED_AMOUNT")
        String discountType,
        @NotNull(message = "Giá trị giảm không được để trống")
        @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
        @Digits(integer = 8, fraction = 2, message = "Giá trị giảm tối đa 8 chữ số nguyên và 2 chữ số thập phân")
        BigDecimal discountValue,
        @NotNull(message = "Thời gian bắt đầu không được để trống")
        LocalDateTime startAt,
        @NotNull(message = "Thời gian kết thúc không được để trống")
        LocalDateTime endAt,
        Boolean isActive
) {
}
