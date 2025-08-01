package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.model.Attendance;
import com.edtech.edtech_backend.model.Course;
import com.edtech.edtech_backend.model.User;
import com.edtech.edtech_backend.repository.AttendanceRepository;
import com.edtech.edtech_backend.repository.CourseRepository;
import com.edtech.edtech_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service // 비즈니스 로직을 처리하는 서비스 레이어
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ 출석 기록 생성 (출석 또는 결석)
    public Attendance recordAttendance(Long courseId, Long userId, Boolean isPresent) {
        // 강의 유효성 검증
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        // 사용자 유효성 검증
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 출석 객체 생성 및 저장
        Attendance attendance = new Attendance(course, user, isPresent);
        return attendanceRepository.save(attendance);
    }

    // ✅ 특정 강의 + 사용자 기준 출석 이력 전체 조회
    public List<Attendance> getAttendancesByCourseAndUser(Long courseId, Long userId) {
        return attendanceRepository.findByCourseIdAndUserId(courseId, userId);
    }

    // ✅ 출석률 계산 (출석 횟수 / 전체 출석 기록 * 100)
    public Double calculateAttendanceRate(Long courseId, Long userId) {
        List<Attendance> attendances = attendanceRepository.findByCourseIdAndUserId(courseId, userId);

        if (attendances.isEmpty()) {
            return 0.0;
        }

        // 출석한 횟수만 카운팅
        long presentCount = attendances.stream()
            .mapToLong(att -> att.getIsPresent() ? 1 : 0)
            .sum();

        // 출석률 (%) 계산
        return (double) presentCount / attendances.size() * 100;
    }

    // ✅ 날짜 범위로 출석 기록 조회 (리포트 등에서 활용)
    public List<Attendance> getAttendancesByDateRange(Long courseId, Long userId,
                                                      LocalDateTime startDate, LocalDateTime endDate) {
        return attendanceRepository.findByCourseIdAndUserIdAndDateRange(courseId, userId, startDate, endDate);
    }
}
