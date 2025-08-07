// src/main/java/com/edtech/edtech_backend/controller/CourseController.java
package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.CourseCreateRequestDto;
import com.edtech.edtech_backend.dto.CourseSummaryDto;
import com.edtech.edtech_backend.dto.StudentSummaryDto;
import com.edtech.edtech_backend.entity.ClassEntity;
import com.edtech.edtech_backend.entity.Course;
import com.edtech.edtech_backend.entity.Enrollment;
import com.edtech.edtech_backend.repository.ClassRepository;
import com.edtech.edtech_backend.repository.CourseRepository;
import com.edtech.edtech_backend.repository.EnrollmentRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/classes/{classId}")
@RequiredArgsConstructor
public class CourseController {

    private final ClassRepository classRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    /** 코스 목록: 누구나 조회 가능 */
    @GetMapping("/courses")
    public List<CourseSummaryDto> listCourses(@PathVariable Long classId) {
        return courseRepository.findByClassEntity_ClassId(classId)
                .stream()
                .map(c -> new CourseSummaryDto(c.getCourseId(), c.getTitle()))
                .toList();
    }

    /** 코스 생성: 관리자만 */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(@PathVariable Long classId,
                                          @RequestBody CourseCreateRequestDto dto) {
        ClassEntity cls = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("invalid classId"));
        Course c = new Course();
        c.setTitle(dto.getTitle());
        c.setInstructor(dto.getInstructor());
        c.setMaterialUrl(dto.getMaterialUrl());
        c.setTag(dto.getTag());
        c.setClassEntity(cls);
        Course saved = courseRepository.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CourseSummaryDto(saved.getCourseId(), saved.getTitle()));
    }

    /** 수강생 조회: 관리자만 */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/students")
    public List<StudentSummaryDto> students(@PathVariable Long classId) {
        var list = enrollmentRepository.findWithUserByClassId(classId);
        DateTimeFormatter F = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return list.stream()
                .map(e -> new StudentSummaryDto(
                        e.getUser().getUserId(),
                        e.getUser().getName(),
                        e.getUser().getEmail(),
                        e.getUser().getPhone(),
                        e.getCreatedAt() != null ? e.getCreatedAt().format(F) : ""
                ))
                .toList();
    }
}
