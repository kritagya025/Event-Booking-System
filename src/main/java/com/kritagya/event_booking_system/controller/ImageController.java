package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.service.ImageStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/images")
@Tag(name = "Images", description = "Endpoints for uploading, streaming, and managing event banners and media")
public class ImageController {

    private final ImageStorageService imageStorageService;

    public ImageController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Upload image", description = "Uploads an image file (JPEG, PNG, WEBP) for event banners or venue layouts. Requires ADMIN or ORGANIZER role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Image uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file or unsupported format"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN or ORGANIZER role")
    })
    public ResponseEntity<Map<String, String>> uploadImage(
            @Parameter(description = "Multipart file to upload") @RequestParam("file") MultipartFile file) {
        String imageUrl = imageStorageService.storeImage(file);
        return new ResponseEntity<>(Map.of("imageUrl", imageUrl), HttpStatus.CREATED);
    }

    @GetMapping("/{filename:.+}")
    @Operation(summary = "Stream image by filename", description = "Serves stored images inline with appropriate media content type headers.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Image file served"),
            @ApiResponse(responseCode = "404", description = "Image not found")
    })
    public ResponseEntity<Resource> getImage(
            @Parameter(description = "Filename of the stored image") @PathVariable String filename) {
        Resource resource = imageStorageService.loadImageAsResource(filename);
        MediaType mediaType = MediaType.IMAGE_JPEG;
        if (filename.toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (filename.toLowerCase().endsWith(".pdf")) {
            mediaType = MediaType.APPLICATION_PDF;
        }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{filename:.+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete image by filename", description = "Removes stored image asset from storage directory. Requires ADMIN or ORGANIZER role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Image deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN or ORGANIZER role"),
            @ApiResponse(responseCode = "404", description = "Image not found")
    })
    public ResponseEntity<Void> deleteImage(
            @Parameter(description = "Filename of the image to delete") @PathVariable String filename) {
        imageStorageService.deleteImage(filename);
        return ResponseEntity.noContent().build();
    }
}
