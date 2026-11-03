package com.example.ecomerce_backend.model.mapper;

import com.example.ecomerce_backend.model.dto.response.ProductResponse;
import com.example.ecomerce_backend.model.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProductMapper {
    @Mapping(source = "productImages", target = "images")
    ProductResponse toProductResponse(Product product);
}
