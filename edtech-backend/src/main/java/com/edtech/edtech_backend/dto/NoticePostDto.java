// dto/NoticePostDto.java

package com.edtech.edtech_backend.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class NoticePostDto {
    private String title;
    private String content;
    private String author;
    private MultipartFile file;  // 파일 받을 필드
}