package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.request.FlashSaleRequest;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.FlashSaleResponse;
import com.example.ecomerce_backend.model.dto.response.PageResponse;
import com.example.ecomerce_backend.service.FlashSaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/flash-sales")
@RequiredArgsConstructor
public class AdminFlashSaleController {
    private final FlashSaleService flashSaleService;

    @GetMapping
    public ResponseEntity<ApiDataResponse<PageResponse<FlashSaleResponse>>> findAll(
            @RequestParam(required = false) String scope,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Lấy danh sách Flash Sale thành công",
                flashSaleService.findAll(scope, active, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiDataResponse<FlashSaleResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiDataResponse.ok("Lấy chi tiết Flash Sale thành công",
                flashSaleService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiDataResponse<FlashSaleResponse>> create(@Valid @RequestBody FlashSaleRequest request) {
        return ResponseEntity.status(201)
                .body(ApiDataResponse.created("Tạo Flash Sale thành công", flashSaleService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiDataResponse<FlashSaleResponse>> update(
            @PathVariable Long id, @Valid @RequestBody FlashSaleRequest request
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok("Cập nhật Flash Sale thành công",
                flashSaleService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiDataResponse<Void>> delete(@PathVariable Long id) {
        flashSaleService.delete(id);
        return ResponseEntity.ok(ApiDataResponse.ok("Xóa Flash Sale thành công", null));
    }
}
