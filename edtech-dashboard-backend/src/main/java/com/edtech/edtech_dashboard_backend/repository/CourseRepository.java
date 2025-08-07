package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository // Spring이 자동으로 Bean 등록
public interface CourseRepository extends JpaRepository<Course, Long> {

    // ✅ 강의 제목에 특정 키워드가 포함된 강의 검색 (기본 메서드 이름 기반)
    List<Course> findByTitleContaining(String title);

    // ✅ 강의 제목 또는 설명에 키워드가 포함된 강의 검색 (JPQL 사용)
    @Query("SELECT c FROM Course c WHERE c.title LIKE %:keyword% OR c.description LIKE %:keyword%")
    List<Course> findByKeyword(@Param("keyword") String keyword);

    // ✅ 특정 사용자가 수강 중인 강의 목록 조회 (출석 테이블 조인 기반)
    @Query("SELECT c FROM Course c JOIN c.attendances a WHERE a.user.id = :userId")
    List<Course> findCoursesByUserId(@Param("userId") Long userId);
}
