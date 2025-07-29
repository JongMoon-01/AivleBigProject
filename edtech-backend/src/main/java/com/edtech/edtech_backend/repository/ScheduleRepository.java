package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
}