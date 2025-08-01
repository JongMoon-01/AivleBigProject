package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.CourseEngagementAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseEngagementAnalyticsRepository extends JpaRepository<CourseEngagementAnalytics, Long> {
    List<CourseEngagementAnalytics> findByLecture_LectureId(Long lectureId);
    List<CourseEngagementAnalytics> findByUserId(String userId);
}
