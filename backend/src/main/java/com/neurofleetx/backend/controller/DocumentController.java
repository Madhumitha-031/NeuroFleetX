package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.model.UserDocument;
import com.neurofleetx.backend.model.User;
import com.neurofleetx.backend.repository.UserDocumentRepository;
import com.neurofleetx.backend.repository.UserRepository;
import com.neurofleetx.backend.repository.ActivityLogRepository;
import com.neurofleetx.backend.model.ActivityLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentController {

    @Autowired
    private UserDocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        try {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
            }

            UserDocument document = UserDocument.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .data(file.getBytes())
                    .uploadDate(LocalDateTime.now())
                    .user(user)
                    .build();

            if (document != null) {
                documentRepository.save(document);
            }

            // Log activity
            activityLogRepository.save(new ActivityLog(
                    email, "UPLOAD_DOC", "Uploaded file: " + file.getOriginalFilename(), LocalDateTime.now()));

            return ResponseEntity.ok(Map.of("message", "File uploaded successfully: " + file.getOriginalFilename()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not upload the file: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().body("ID cannot be null");
        try {
            UserDocument document = documentRepository.findById(id).orElse(null);
            if (document == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found");
            }

            String email = document.getUser().getEmail();
            documentRepository.delete(document);

            // Log activity
            activityLogRepository.save(new ActivityLog(
                    email, "DELETE_DOC", "Deleted file: " + document.getFileName(), LocalDateTime.now()));

            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not delete the file: " + e.getMessage());
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Map<String, Object>>> getDocumentsByUser(@PathVariable String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        List<UserDocument> docs = documentRepository.findByUser_Id(user.getId());
        List<Map<String, Object>> response = docs.stream().map(doc -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", doc.getId());
            map.put("fileName", doc.getFileName());
            map.put("fileType", doc.getFileType());
            map.put("uploadDate", doc.getUploadDate());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        UserDocument document = documentRepository.findById(id).orElse(null);
        if (document == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        String contentType = document.getFileType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .body(document.getData());
    }

    @GetMapping("/agent/client/{email}")
    public ResponseEntity<?> getClientDocumentsForAgent(@PathVariable String email) {
        try {
            User client = userRepository.findByEmail(email).orElse(null);
            if (client == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Client not found");
            }

            List<UserDocument> docs = documentRepository.findByUser_Id(client.getId());
            List<Map<String, Object>> response = docs.stream().map(doc -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", doc.getId());
                map.put("fileName", doc.getFileName());
                map.put("fileType", doc.getFileType());
                map.put("uploadDate", doc.getUploadDate());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
