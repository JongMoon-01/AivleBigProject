package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.NoticePost;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticePostRepository extends JpaRepository<NoticePost, Long> {
    List<NoticePost> findByClassEntity_ClassId(Long classId);
}
