package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.QnaComment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QnaCommentRepository extends JpaRepository<QnaComment, Long> {
    List<QnaComment> findByQnaPost_Id(Long qnaPostId);
}
