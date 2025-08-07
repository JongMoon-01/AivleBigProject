package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository // 스프링이 자동으로 빈으로 등록하도록 지정
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    // ✅ 특정 강의와 사용자에 대한 전체 출석 목록 조회
    List<Attendance> findByCourseIdAndUserId(Long courseId, Long userId);
    
    // ✅ 특정 강의의 모든 출석 기록 조회
    List<Attendance> findByCourseId(Long courseId);
    
    // ✅ 특정 사용자의 모든 출석 기록 조회
    List<Attendance> findByUserId(Long userId);
    
    // ✅ 강의 + 사용자 + 날짜 범위로 필터링된 출석 기록 조회
    @Query("SELECT a FROM Attendance a WHERE a.course.id = :courseId AND a.user.id = :userId AND a.attendanceDate BETWEEN :startDate AND :endDate")
    List<Attendance> findByCourseIdAndUserIdAndDateRange(
        @Param("courseId") Long courseId,
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // ✅ 특정 강의에서 특정 사용자가 출석한 횟수 (isPresent = true)
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.course.id = :courseId AND a.user.id = :userId AND a.isPresent = true")
    Long countPresentAttendances(
        @Param("courseId") Long courseId,
        @Param("userId") Long userId
    );
}
