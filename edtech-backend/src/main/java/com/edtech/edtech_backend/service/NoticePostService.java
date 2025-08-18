package com.edtech.edtech_backend.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import com.edtech.edtech_backend.dto.NoticePostDto;
import com.edtech.edtech_backend.entity.ClassEntity;
import com.edtech.edtech_backend.entity.NoticePost;
import com.edtech.edtech_backend.repository.ClassRepository;
import com.edtech.edtech_backend.repository.NoticePostRepository;

@Service
@RequiredArgsConstructor
public class NoticePostService {

    private final NoticePostRepository noticePostRepository;
    private final ClassRepository classRepository;

    // 저장할 경로 (실제 프로젝트에서는 application.yml이나 환경변수로 관리하는 게 좋아)
    private final String UPLOAD_DIR = "uploads/";

    public NoticePost createPost(Long classId, NoticePostDto dto) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        NoticePost post = new NoticePost();
        post.setClassEntity(classEntity);
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setAuthor(dto.getAuthor());
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        // 파일 처리
        MultipartFile file = dto.getFile();
        if (file != null && !file.isEmpty()) {
            try {
                // 고유 파일 이름 생성
                String originalFilename = file.getOriginalFilename();
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

                // 저장 디렉토리 생성
                File dir = new File(UPLOAD_DIR);
                if (!dir.exists()) dir.mkdirs();

                // 파일 저장
                File destination = new File(UPLOAD_DIR + uniqueFileName);
                file.transferTo(destination);

                // 파일명 또는 경로 저장
                post.setFileName(uniqueFileName); // 엔티티에 해당 필드 있어야 함
            } catch (IOException e) {
                throw new RuntimeException("파일 업로드 실패", e);
            }
        }

        return noticePostRepository.save(post);
    }

    public List<NoticePost> getPost(Long classId) {
        return noticePostRepository.findByClassEntity_ClassId(classId);
    }

    public void deletePost(Long postId) {
        noticePostRepository.deleteById(postId);
    }

    public NoticePost updatePost(Long postId, NoticePostDto dto) {
        NoticePost post = noticePostRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setUpdatedAt(LocalDateTime.now());

        // 업데이트 시 새 파일이 들어왔으면 교체
        MultipartFile file = dto.getFile();
        if (file != null && !file.isEmpty()) {
            try {
                String originalFilename = file.getOriginalFilename();
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

                File dir = new File(UPLOAD_DIR);
                if (!dir.exists()) dir.mkdirs();

                File destination = new File(UPLOAD_DIR + uniqueFileName);
                file.transferTo(destination);

                post.setFileName(uniqueFileName);
            } catch (IOException e) {
                throw new RuntimeException("파일 업로드 실패", e);
            }
        }

        return noticePostRepository.save(post);
    }

    public NoticePost getPostById(Long postId) {
        return noticePostRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("해당 게시글이 존재하지 않습니다."));
    }

}