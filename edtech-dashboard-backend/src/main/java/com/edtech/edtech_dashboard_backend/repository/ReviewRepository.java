package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository // Spring이 자동으로 Bean으로 등록
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ✅ 특정 강의 + 사용자에 대해 아직 복습하지 않은 구간만 조회
    List<Review> findByCourseIdAndUserIdAndIsReviewedFalse(Long courseId, Long userId);

    // ✅ 특정 강의 + 사용자에 대한 전체 복습 이력 조회 (복습 여부 관계없이)
    List<Review> findByCourseIdAndUserId(Long courseId, Long userId);
}
