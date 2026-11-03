package com.example.ecomerce_backend.model.dto.response;

import java.util.List;

public record ListBankResponse(
        List<BankResponse> data
) {
}
