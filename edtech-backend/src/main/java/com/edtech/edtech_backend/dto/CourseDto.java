package com.edtech.edtech_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseDto {
    private Long classId;     // 어떤 클래스에 속하는 코스인지
    private String title;
    private String videoUrl;
}