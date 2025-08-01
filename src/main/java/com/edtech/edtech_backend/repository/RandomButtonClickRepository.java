package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.RandomButtonClick;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RandomButtonClickRepository extends JpaRepository<RandomButtonClick, Long> {
    List<RandomButtonClick> findByLectureIdAndUserId(Long lectureId, String userId);
}

