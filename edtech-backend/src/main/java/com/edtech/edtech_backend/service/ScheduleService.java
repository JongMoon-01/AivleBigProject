package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.dto.ScheduleDto;
import com.edtech.edtech_backend.entity.ClassEntity;
import com.edtech.edtech_backend.entity.Schedule;
import com.edtech.edtech_backend.repository.ClassRepository;
import com.edtech.edtech_backend.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ClassRepository classRepository;

    public Schedule save(ScheduleDto dto) {
        ClassEntity classEntity = classRepository.findById(dto.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("해당 클래스가 없습니다."));

        Schedule schedule = Schedule.builder()
                .classEntity(classEntity)
                .title(dto.getTitle())
                .scheduleDate(dto.getScheduleDate())
                .build();

        return scheduleRepository.save(schedule);
    }

    public List<Schedule> findAll() {
        return scheduleRepository.findAll();
    }
}