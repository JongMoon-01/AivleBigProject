package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.dto.CourseDto;
import com.edtech.edtech_backend.dto.CourseResponseDto;
import com.edtech.edtech_backend.entity.ClassEntity;
import com.edtech.edtech_backend.entity.Course;
import com.edtech.edtech_backend.repository.ClassRepository;
import com.edtech.edtech_backend.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final ClassRepository classRepository;

    public Course save(CourseDto dto) {
        ClassEntity classEntity = classRepository.findById(dto.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("해당 클래스가 없습니다."));

        Course course = Course.builder()
                .classEntity(classEntity)
                .title(dto.getTitle())
                .videoUrl(dto.getVideoUrl())
                .build();

        return courseRepository.save(course);
    }

    public List<Course> findAll() {
        return courseRepository.findAll();
    }

    public List<CourseResponseDto> findAllAsDto() {
        return courseRepository.findAll().stream()
                .map(c -> new CourseResponseDto(
                        c.getCourseId(),
                        c.getClassEntity().getClassId(),
                        c.getTitle(),
                        c.getVideoUrl()
                ))
                .toList();
    }
}