package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.request.CreateAdminRequest;
import com.example.ecomerce_backend.model.dto.response.AdminUserResponse;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.PageResponse;
import com.example.ecomerce_backend.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiDataResponse<PageResponse<AdminUserResponse>>> getUsers(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "10") Integer size
    ) {
        return ResponseEntity.ok(ApiDataResponse.ok(
                "Lấy danh sách người dùng thành công",
                adminUserService.getUsers(keyword, role, page, size)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiDataResponse<AdminUserResponse>> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        return ResponseEntity.ok(ApiDataResponse.ok(
                "Tạo tài khoản admin thành công",
                adminUserService.createAdmin(request)
        ));
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<ApiDataResponse<Void>> blockUser(@PathVariable Long id) {
        adminUserService.blockUser(id);
        return ResponseEntity.ok(ApiDataResponse.ok("Khóa tài khoản thành công", null));
    }

    @PatchMapping("/{id}/unblock")
    public ResponseEntity<ApiDataResponse<Void>> unblockUser(@PathVariable Long id) {
        adminUserService.unblockUser(id);
        return ResponseEntity.ok(ApiDataResponse.ok("Mở khóa tài khoản thành công", null));
    }
}