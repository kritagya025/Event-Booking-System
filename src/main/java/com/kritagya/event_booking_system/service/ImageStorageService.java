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
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String storedFilename = UUID.randomUUID().toString() + fileExtension;
        Path targetLocation = this.uploadDirectory.resolve(storedFilename);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("Image stored successfully: {}", storedFilename);
            return "/api/images/" + storedFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image file.", e);
        }
    }

    public Resource loadImageAsResource(String filename) {
        try {
            Path filePath = this.uploadDirectory.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IllegalArgumentException("Image not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Invalid image path: " + filename, e);
        }
    }

    public void deleteImage(String filename) {
        try {
            Path filePath = this.uploadDirectory.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
            log.info("Image deleted: {}", filename);
        } catch (IOException e) {
            log.error("Failed to delete image file: {}", filename, e);
        }
    }
}
