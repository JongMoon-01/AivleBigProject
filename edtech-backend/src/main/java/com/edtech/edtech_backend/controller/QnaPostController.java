package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.QnaPostDto;
import com.edtech.edtech_backend.service.QnaPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/class/{classId}/qna")
@RequiredArgsConstructor
public class QnaPostController {

    private final QnaPostService qnaPostService;

    @PostMapping
    public ResponseEntity<?> createPost(@PathVariable Long classId, @RequestBody QnaPostDto dto) {
        return ResponseEntity.ok(qnaPostService.createPost(classId, dto));
    }

    @GetMapping
    public ResponseEntity<?> getPosts(@PathVariable Long classId) {
        return ResponseEntity.ok(qnaPostService.getPosts(classId));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getPost(@PathVariable Long postId) {
        return ResponseEntity.ok(qnaPostService.getPost(postId));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
        @PathVariable Long postId,
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(qnaPostService.updatePost(postId, title, content, file));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        qnaPostService.deletePost(postId);
        return ResponseEntity.ok().build();
    }
}
