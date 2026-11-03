package com.example.ecomerce_backend.model.dto.response;

public record UserRegisterResponse(
        UserResponse user,
        UserInformationResponse userInformation
) {
}
