package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}