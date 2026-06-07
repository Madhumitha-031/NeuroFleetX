package com.neurofleetx.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_documents")
public class UserDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] data;

    private LocalDateTime uploadDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public UserDocument() {
    }

    public UserDocument(String fileName, String fileType, byte[] data, LocalDateTime uploadDate, User user) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.data = data;
        this.uploadDate = uploadDate;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public static UserDocumentBuilder builder() {
        return new UserDocumentBuilder();
    }

    public static class UserDocumentBuilder {
        private String fileName;
        private String fileType;
        private byte[] data;
        private LocalDateTime uploadDate;
        private User user;

        public UserDocumentBuilder fileName(String fileName) {
            this.fileName = fileName;
            return this;
        }

        public UserDocumentBuilder fileType(String fileType) {
            this.fileType = fileType;
            return this;
        }

        public UserDocumentBuilder data(byte[] data) {
            this.data = data;
            return this;
        }

        public UserDocumentBuilder uploadDate(LocalDateTime uploadDate) {
            this.uploadDate = uploadDate;
            return this;
        }

        public UserDocumentBuilder user(User user) {
            this.user = user;
            return this;
        }

        public UserDocument build() {
            return new UserDocument(fileName, fileType, data, uploadDate, user);
        }
    }
}
