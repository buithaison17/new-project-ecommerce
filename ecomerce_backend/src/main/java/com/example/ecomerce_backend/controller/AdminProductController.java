package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.request.CreateProductRequest;
import com.example.ecomerce_backend.model.dto.request.UpdateProductRequest;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.ProductResponse;
import com.example.ecomerce_backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {
    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiDataResponse<ProductResponse>> create(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(201)
                .body(ApiDataResponse.created("Tạo sản phẩm thành công", productService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiDataResponse<ProductResponse>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateProductRequest request
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Cập nhật sản phẩm thành công", productService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiDataResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiDataResponse.ok("Xóa sản phẩm thành công", null));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiDataResponse<ProductResponse>> uploadImage(
            @PathVariable Long id, @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.status(201)
                .body(ApiDataResponse.created("Tải ảnh lên thành công", productService.addImage(id, file)));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<ApiDataResponse<ProductResponse>> deleteImage(
            @PathVariable Long id, @PathVariable Long imageId
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Xóa ảnh thành công", productService.deleteImage(id, imageId)));
    }
}