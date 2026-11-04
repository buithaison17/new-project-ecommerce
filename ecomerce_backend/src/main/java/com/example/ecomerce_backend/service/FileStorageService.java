package com.example.ecomerce_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.ecomerce_backend.exception.BadRequestException;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {
    public static final String PUBLIC_PREFIX = "/uploads/";
    // Chỉ chấp nhận ảnh; đuôi file lấy từ whitelist này, không lấy từ tên file người dùng gửi lên
    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    @Getter
    private final Path root;
    private final Cloudinary cloudinary;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String uploadDir, Cloudinary cloudinary) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Không thể tạo thư mục upload: " + root, e);
        }
        this.cloudinary = cloudinary;
    }

    public String extractPublicId(String imageUrl) {
        int start = imageUrl.indexOf("/upload/");

        if (start == -1) {
            throw new IllegalArgumentException("URL không hợp lệ");
        }

        String path = imageUrl.substring(start + "/upload/".length());

        if (path.matches("v\\d+/.*")) {
            path = path.substring(path.indexOf("/") + 1);
        }

        int dotIndex = path.lastIndexOf(".");

        return dotIndex == -1 ? path : path.substring(0, dotIndex);
    }

    public void deleteImage(String url) {
        String publicId = extractPublicId(url);

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", "image")
            );

            String status = (String) result.get("result");

            if (!"ok".equals(status) && !"not found".equals(status)) {
                throw new RuntimeException(
                        "Không thể xóa ảnh trên Cloudinary: " + status
                );
            }
        } catch (Exception e) {
            throw new RuntimeException(
                    "Lỗi khi xóa ảnh trên Cloudinary", e
            );
        }
    }

    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File ảnh không được để trống");
        }
        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new BadRequestException("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF");
        }
        try {
            return cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("resource_type", "image")
            ).get("secure_url").toString();
        } catch (IOException e) {
            throw new UncheckedIOException("Không thể lưu file ảnh", e);
        }
    }
}