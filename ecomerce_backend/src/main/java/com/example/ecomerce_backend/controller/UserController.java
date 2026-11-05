package com.example.ecomerce_backend.controller;

import com.example.ecomerce_backend.model.dto.request.ChangePasswordRequest;
import com.example.ecomerce_backend.model.dto.request.UserChangeInformationRequest;
import com.example.ecomerce_backend.model.dto.request.UserDeliveryRequest;
import com.example.ecomerce_backend.model.dto.response.ApiDataResponse;
import com.example.ecomerce_backend.model.dto.response.UserDeliveryResponse;
import com.example.ecomerce_backend.model.dto.response.UserRegisterResponse;
import com.example.ecomerce_backend.security.principal.UserPrincipal;
import com.example.ecomerce_backend.service.AuthService;
import com.example.ecomerce_backend.service.UserDeliveryService;
import com.example.ecomerce_backend.service.UserInformationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserInformationService userInformationService;
    private final AuthService authService;
    private final UserDeliveryService userDeliveryService;

    @PatchMapping
    public ResponseEntity<ApiDataResponse<UserRegisterResponse>> changeInformation(
            @ModelAttribute UserChangeInformationRequest request
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Cập nhật thông tin thành công",
                userInformationService.changeInformation(request),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PatchMapping("/change-password")
    public ResponseEntity<ApiDataResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(request);
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Cập nhật mật khẩu thành công",
                null,
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @GetMapping("/deliveries")
    public ResponseEntity<ApiDataResponse<List<UserDeliveryResponse>>> findAll(
            @RequestParam(value = "currentPage", defaultValue = "1") Integer currentPage,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Lấy danh sách địa chỉ nhận hàng thành công",
                userDeliveryService.findAll(currentPage, pageSize),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PostMapping("/deliveries")
    public ResponseEntity<ApiDataResponse<UserDeliveryResponse>> createUserDelivery(@Valid @RequestBody UserDeliveryRequest request) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Tạo địa chỉ nhận hàng thành công",
                userDeliveryService.createUserDelivery(request),
                null,
                HttpStatus.CREATED
        ), HttpStatus.CREATED);
    }

    @PatchMapping("/deliveries/{id}")
    public ResponseEntity<ApiDataResponse<UserDeliveryResponse>> updateUserDelivery(
            @PathVariable Long id,
            @Valid @RequestBody UserDeliveryRequest request
    ) {
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Cập nhật địa chỉ nhận hàng thành công",
                userDeliveryService.updateUserDelivery(id, request),
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }

    @PatchMapping("/deliveries/{id}/delete")
    public ResponseEntity<ApiDataResponse<Void>> deleteUserDelivery(
            @PathVariable Long id
    ) {
        userDeliveryService.deleteUserDelivery(id);
        return new ResponseEntity<>(new ApiDataResponse<>(
                true,
                "Xóa địa chỉ nhận hàng thành công",
                null,
                null,
                HttpStatus.OK
        ), HttpStatus.OK);
    }
}