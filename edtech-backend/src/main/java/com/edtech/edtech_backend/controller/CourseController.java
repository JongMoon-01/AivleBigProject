package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.CourseDto;
import com.edtech.edtech_backend.entity.Course;
import com.edtech.edtech_backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // 코스 등록
    @PostMapping
    public Course createCourse(@RequestBody CourseDto courseDto) {
        return courseService.save(courseDto);
    }

    // 전체 코스 조회
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.findAll();
    }
}
