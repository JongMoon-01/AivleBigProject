package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.model.Course;
import com.edtech.edtech_backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // 강의 관련 비즈니스 로직을 처리하는 서비스 계층
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    // ✅ 전체 강의 목록 조회
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // ✅ 특정 ID에 해당하는 강의 조회 (Optional로 반환)
    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    // ✅ 새 강의 등록
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    // ✅ 기존 강의 정보 수정
    public Course updateCourse(Long id, Course courseDetails) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        // 제목과 설명만 수정 가능
        course.setTitle(courseDetails.getTitle());
        course.setDescription(courseDetails.getDescription());

        return courseRepository.save(course);
    }

    // ✅ 강의 삭제
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        courseRepository.delete(course);
    }

    // ✅ 키워드를 포함하는 강의 제목 또는 설명으로 검색
    public List<Course> searchCourses(String keyword) {
        return courseRepository.findByKeyword(keyword);
    }

    // ✅ 특정 사용자가 수강 중인 강의 목록 조회
    public List<Course> getCoursesByUserId(Long userId) {
        return courseRepository.findCoursesByUserId(userId);
    }
}
