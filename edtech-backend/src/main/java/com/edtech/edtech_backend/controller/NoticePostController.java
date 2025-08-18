package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.NoticePostDto;
import com.edtech.edtech_backend.entity.NoticePost;
import com.edtech.edtech_backend.service.NoticePostService;

import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/class/{classId}/notice")
@RequiredArgsConstructor
public class NoticePostController {

    private final NoticePostService noticePostService;

    @PostMapping
    public ResponseEntity<?> createPost(
        @PathVariable Long classId,
        @ModelAttribute NoticePostDto dto  // FormData를 받을 수 있도록!
    ) {
        return ResponseEntity.ok(noticePostService.createPost(classId, dto));
    }

    @GetMapping
    public ResponseEntity<?> getPosts(@PathVariable Long classId) {
        return ResponseEntity.ok(noticePostService.getPost(classId));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostDetail(@PathVariable Long postId) {
        NoticePost post = noticePostService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
        @PathVariable Long postId,
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(noticePostService.updatePost(postId, title, content, file));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        noticePostService.deletePost(postId);
        return ResponseEntity.ok().build();
    }
}