package com.xuzhidong.aitest.ai.dto;

import jakarta.validation.constraints.NotBlank;

public class ApiDocumentImportRequestDTO {

    @NotBlank
    private String documentContent;

    private String format;

    public String getDocumentContent() {
        return documentContent;
    }

    public void setDocumentContent(String documentContent) {
        this.documentContent = documentContent;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }
}
