package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.dto.CourseDto;
import com.edtech.edtech_backend.entity.ClassEntity;
import com.edtech.edtech_backend.entity.Course;
import com.edtech.edtech_backend.repository.ClassRepository;
import com.edtech.edtech_backend.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ClassRepository classRepository;

    // Course 저장
    public Course save(CourseDto dto) {
        // Class에 속하지 않는 경우
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
}