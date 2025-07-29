package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.model.Course;
import com.edtech.edtech_backend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // 이 클래스가 REST API의 컨트롤러임을 명시
@RequestMapping("/api/courses") // 모든 요청 경로는 /api/courses로 시작
@CrossOrigin(origins = "*") // 모든 프론트엔드 도메인에서의 CORS 요청 허용
public class CourseController {

    @Autowired
    private CourseService courseService; // 서비스 레이어 의존성 주입

    // ✅ 전체 강좌 목록 조회
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses); // 200 OK + 강좌 리스트 반환
    }

    // ✅ 특정 ID의 강좌 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id)
            .map(course -> ResponseEntity.ok().body(course)) // 강좌가 있으면 200 OK
            .orElse(ResponseEntity.notFound().build());      // 없으면 404 Not Found
    }

    // ✅ 새 강좌 등록
    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        Course createdCourse = courseService.createCourse(course);
        return ResponseEntity.ok(createdCourse); // 생성된 강좌를 반환 (200 OK)
    }

    // ✅ 기존 강좌 정보 수정
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        try {
            Course updatedCourse = courseService.updateCourse(id, courseDetails);
            return ResponseEntity.ok(updatedCourse); // 수정 성공 시 200 OK
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // ID에 해당하는 강좌가 없으면 404 반환
        }
    }

    // ✅ 강좌 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok().build(); // 삭제 성공 시 200 OK
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 삭제할 강좌가 없으면 404
        }
    }

    // ✅ 키워드로 강좌 검색 (예: 제목, 설명 등에 키워드 포함된 강좌 검색)
    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourses(@RequestParam String keyword) {
        List<Course> courses = courseService.searchCourses(keyword);
        return ResponseEntity.ok(courses); // 검색 결과 반환
    }

    // ✅ 특정 사용자(userId)가 수강 중인 강좌 목록 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Course>> getCoursesByUserId(@PathVariable Long userId) {
        List<Course> courses = courseService.getCoursesByUserId(userId);
        return ResponseEntity.ok(courses); // 사용자별 강좌 리스트 반환
    }
}
