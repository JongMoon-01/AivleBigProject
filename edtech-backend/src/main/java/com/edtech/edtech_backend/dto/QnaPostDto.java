package com.edtech.edtech_backend.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class QnaPostDto {
    private String title;
    private String content;
    private String author;
}
