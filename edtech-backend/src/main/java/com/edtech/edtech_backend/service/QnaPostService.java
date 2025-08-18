package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.dto.QnaPostDto;
import com.edtech.edtech_backend.entity.*;
import com.edtech.edtech_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QnaPostService {
    private final QnaPostRepository qnaPostRepository;
    private final ClassRepository classRepository;

    public QnaPost createPost(Long classId, QnaPostDto dto) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        QnaPost post = new QnaPost();
        post.setClassEntity(classEntity);
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setAuthor(dto.getAuthor());
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        return qnaPostRepository.save(post);
    }

    public List<QnaPost> getPosts(Long classId) {
        return qnaPostRepository.findByClassEntity_ClassId(classId);
    }

    public QnaPost getPost(Long postId) {
        return qnaPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public QnaPost updatePost(Long postId, QnaPostDto dto) {
        QnaPost post = getPost(postId);
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setUpdatedAt(LocalDateTime.now());
        return qnaPostRepository.save(post);
    }

    public void deletePost(Long postId) {
        qnaPostRepository.deleteById(postId);
    }

        public QnaPost updatePost(Long postId, String title, String content, MultipartFile file) {
        QnaPost post = qnaPostRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setTitle(title);
        post.setContent(content);
        post.setUpdatedAt(LocalDateTime.now());
        
        return qnaPostRepository.save(post);
    }
}
