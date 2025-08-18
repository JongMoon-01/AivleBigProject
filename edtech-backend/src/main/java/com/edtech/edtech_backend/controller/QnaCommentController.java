package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.QnaCommentDto;
import com.edtech.edtech_backend.service.QnaCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/class/{classId}/qna/{postId}/comment")
@RequiredArgsConstructor
public class QnaCommentController {

    private final QnaCommentService qnaCommentService;

    @PostMapping
    public ResponseEntity<?> addComment(@PathVariable Long classId, @PathVariable Long postId, @RequestBody QnaCommentDto dto) {
        return ResponseEntity.ok(qnaCommentService.addComment(postId, dto));
    }

    @GetMapping
    public ResponseEntity<?> getComments(@PathVariable Long classId, @PathVariable Long postId) {
        return ResponseEntity.ok(qnaCommentService.getComments(postId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long classId, @PathVariable Long commentId) {
        qnaCommentService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }
}
