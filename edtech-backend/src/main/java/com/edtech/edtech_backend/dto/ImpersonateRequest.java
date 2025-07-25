package com.edtech.edtech_backend.dto;

import jakarta.validation.constraints.NotNull;

public class ImpersonateRequest {
    
    @NotNull(message = "사용자 ID는 필수 입력값입니다.")
    private Long studentId;
    
    public ImpersonateRequest() {}
    
    public ImpersonateRequest(Long studentId) {
        this.studentId = studentId;
    }
    
    public Long getStudentId() {
        return studentId;
    }
    
    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
}