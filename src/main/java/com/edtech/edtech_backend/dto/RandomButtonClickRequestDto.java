package com.edtech.edtech_backend.dto;

import lombok.Getter;

@Getter
public class RandomButtonClickRequestDto {
    private Long lectureId;
    private String buttonId;
    private boolean clicked;
}
