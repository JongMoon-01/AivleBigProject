package com.edtech.edtech_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScheduleDto {
    private Long classId;          // 어떤 클래스에 속한 일정인지
    private String title;
    private String scheduleDate;   // 예: "2025-08-01"
}