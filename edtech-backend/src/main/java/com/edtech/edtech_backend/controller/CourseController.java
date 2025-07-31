package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.CourseDto;
import com.edtech.edtech_backend.dto.CourseResponseDto;
import com.edtech.edtech_backend.entity.Course;
import com.edtech.edtech_backend.service.CourseService;
import com.edtech.edtech_backend.repository.CourseRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseRepository courseRepository;

    @PostMapping
    public Course createCourse(@RequestBody CourseDto courseDto) {
        return courseService.save(courseDto);
    }

    @GetMapping("/entity")
    public List<Course> getAllCourses() {
        return courseService.findAll();
    }

    @GetMapping("/dto")
    public List<CourseResponseDto> getAllCoursesDto() {
        return courseService.findAllAsDto();
    }

    @GetMapping
    public List<CourseResponseDto> getCourses(@RequestParam(required = false) Long classId) {
        List<Course> courses;

        if (classId != null) {
            courses = courseRepository.findByClassEntity_ClassId(classId);
        } else {
            courses = courseRepository.findAll();
        }

        return courses.stream()
                .map(course -> new CourseResponseDto(
                        course.getCourseId(),
                        course.getTitle(),
                        course.getVideoUrl(),
                        course.getClassEntity().getClassId()
                ))
                .toList();
    }
}