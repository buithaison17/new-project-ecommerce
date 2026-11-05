package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.FlashSaleResponse;
import com.example.ecomerce_backend.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** API công khai: danh sách chương trình Flash Sale đang chạy. */
@RestController
@RequestMapping("/api/v1/flash-sales")
@RequiredArgsConstructor
public class FlashSaleController {
    private final FlashSaleService flashSaleService;

    @GetMapping("/active")
    public ResponseEntity<ApiDataResponse<List<FlashSaleResponse>>> getActive() {
        return ResponseEntity.ok(ApiDataResponse.ok("Lấy danh sách Flash Sale đang chạy thành công",
                flashSaleService.getActive()));
    }
}
