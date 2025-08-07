package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByClassEntity_ClassId(Long classId);
}
