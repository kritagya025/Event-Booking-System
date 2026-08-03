package com.kritagya.event_booking_system.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);

    private final Path uploadDirectory;

    public ImageStorageService(@Value("${app.upload.dir:uploads/images}") String uploadDir) {
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDirectory);
        } catch (IOException e) {
            log.error("Could not create image upload directory at: {}", this.uploadDirectory, e);
        }
    }

    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

        // Validate File Size (max 20MB)
        long maxSize = 20 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 20MB.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("File name cannot be empty.");
        }

        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex >= 0) {
            fileExtension = originalFilename.substring(dotIndex).toLowerCase();
        }

        // Strict whitelist: ONLY jpg, jpeg, png, pdf allowed
        java.util.List<String> allowedExtensions = java.util.List.of(".jpg", ".jpeg", ".png", ".pdf");
        if (!allowedExtensions.contains(fileExtension)) {
            throw new IllegalArgumentException("Invalid file extension: " + fileExtension + ". Only JPG, JPEG, PNG, and PDF files are allowed.");
        }

        // Validate content using magic bytes inspection (do NOT trust extension or header)
        try (java.io.InputStream is = file.getInputStream()) {
            String detectedMime = detectRealMimeType(is);
            if ("unknown".equals(detectedMime)) {
                throw new IllegalArgumentException("File content type validation failed. File content does not match allowed types (JPG, PNG, PDF).");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not inspect file contents.", e);
        }

        String storedFilename = UUID.randomUUID().toString() + fileExtension;
        Path targetLocation = this.uploadDirectory.resolve(storedFilename).normalize();

        if (!targetLocation.startsWith(this.uploadDirectory)) {
            throw new IllegalArgumentException("Invalid target file location. Path traversal detected.");
        }

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("File stored successfully: {}", storedFilename);
            return "/api/images/" + storedFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    public Resource loadImageAsResource(String filename) {
        try {
            Path filePath = this.uploadDirectory.resolve(filename).normalize();
            if (!filePath.startsWith(this.uploadDirectory)) {
                throw new IllegalArgumentException("Invalid file path: Path traversal attempt detected.");
            }
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IllegalArgumentException("File not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Invalid image path: " + filename, e);
        }
    }

    public void deleteImage(String filename) {
        try {
            Path filePath = this.uploadDirectory.resolve(filename).normalize();
            if (!filePath.startsWith(this.uploadDirectory)) {
                throw new IllegalArgumentException("Invalid file path: Path traversal attempt detected.");
            }
            Files.deleteIfExists(filePath);
            log.info("Image deleted: {}", filename);
        } catch (IOException e) {
            log.error("Failed to delete image file: {}", filename, e);
        }
    }

    private String detectRealMimeType(java.io.InputStream is) throws IOException {
        byte[] header = new byte[8];
        int bytesRead = is.read(header);
        if (bytesRead < 4) {
            return "unknown";
        }
        // PNG magic bytes: 89 50 4E 47
        if ((header[0] & 0xFF) == 0x89 && header[1] == 'P' && header[2] == 'N' && header[3] == 'G') {
            return "image/png";
        }
        // JPEG magic bytes: FF D8 FF
        if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        // PDF magic bytes: %PDF- (25 50 44 46 2D)
        if (header[0] == '%' && header[1] == 'P' && header[2] == 'D' && header[3] == 'F' && header[4] == '-') {
            return "application/pdf";
        }
        return "unknown";
    }
}
