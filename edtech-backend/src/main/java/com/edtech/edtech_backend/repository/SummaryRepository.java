package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.Summary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SummaryRepository extends JpaRepository<Summary, Long> {
}