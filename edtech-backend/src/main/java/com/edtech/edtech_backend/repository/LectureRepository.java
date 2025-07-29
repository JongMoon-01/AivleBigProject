package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureRepository extends JpaRepository<Lecture, Long> {
}