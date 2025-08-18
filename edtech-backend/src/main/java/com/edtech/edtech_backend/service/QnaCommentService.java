package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.dto.QnaCommentDto;
import com.edtech.edtech_backend.entity.*;
import com.edtech.edtech_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QnaCommentService {
    private final QnaPostRepository qnaPostRepository;
    private final QnaCommentRepository qnaCommentRepository;

    public QnaComment addComment(Long postId, QnaCommentDto dto) {
        QnaPost post = qnaPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        QnaComment comment = new QnaComment();
        comment.setQnaPost(post);
        comment.setAuthor(dto.getAuthor());
        comment.setContent(dto.getContent());
        comment.setCreatedAt(LocalDateTime.now());

        return qnaCommentRepository.save(comment);
    }

    public List<QnaComment> getComments(Long postId) {
        return qnaCommentRepository.findByQnaPost_Id(postId);
    }

    public void deleteComment(Long commentId) {
        qnaCommentRepository.deleteById(commentId);
    }
}
