package com.edtech.edtech_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourseResponseDto {
    private Long courseId;
    private Long classId;
    
    private String title;
    private String videoUrl;

    public CourseResponseDto(Long courseId, String title, String videoUrl, Long classId) {
        this.courseId = courseId;
        this.classId = classId;
        this.title = title;
        this.videoUrl = videoUrl;
    }
}