package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.QnaPost;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QnaPostRepository extends JpaRepository<QnaPost, Long> {
    List<QnaPost> findByClassEntity_ClassId(Long classId);
}
