package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.dto.ConcentrationGraphDto;
import com.edtech.edtech_backend.model.Concentration;
import com.edtech.edtech_backend.model.Course;
import com.edtech.edtech_backend.model.User;
import com.edtech.edtech_backend.repository.ConcentrationRepository;
import com.edtech.edtech_backend.repository.CourseRepository;
import com.edtech.edtech_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service // 비즈니스 로직을 처리하는 서비스 컴포넌트로 등록
public class ConcentrationService {

    @Autowired
    private ConcentrationRepository concentrationRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ 집중도 점수 기록 (강의, 사용자, 점수, 시간 위치)
    public Concentration recordConcentration(Long courseId, Long userId, Double score, Integer timelinePosition) {
        // 강의 유효성 확인
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        // 사용자 유효성 확인
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 집중도 객체 생성 및 저장
        Concentration concentration = new Concentration(course, user, score, timelinePosition);
        return concentrationRepository.save(concentration);
    }

    // ✅ 집중도 그래프에 필요한 데이터 생성 (그래프 포맷 + 통계 포함)
    public ConcentrationGraphDto getConcentrationGraphData(Long courseId, Long userId) {
        // 집중도 데이터 시간 순 조회
        List<Concentration> concentrations = concentrationRepository
            .findByCourseIdAndUserIdOrderByTimelinePosition(courseId, userId);

        // DTO 초기화
        ConcentrationGraphDto graphDto = new ConcentrationGraphDto();
        graphDto.setCourseId(courseId);
        graphDto.setUserId(userId);

        // 그래프 포인트 생성: 타임라인 위치, 점수, 측정 시각
        List<ConcentrationGraphDto.ConcentrationPoint> points = concentrations.stream()
            .map(c -> new ConcentrationGraphDto.ConcentrationPoint(
                c.getTimelinePosition(),
                c.getScore(),
                c.getMeasuredAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            ))
            .collect(Collectors.toList());

        graphDto.setConcentrationPoints(points);

        // ✅ 평균, 최대, 최소 집중도 계산
        if (!concentrations.isEmpty()) {
            double average = concentrations.stream()
                .mapToDouble(Concentration::getScore)
                .average()
                .orElse(0.0);

            double max = concentrations.stream()
                .mapToDouble(Concentration::getScore)
                .max()
                .orElse(0.0);

            double min = concentrations.stream()
                .mapToDouble(Concentration::getScore)
                .min()
                .orElse(0.0);

            graphDto.setAverageConcentration(average);
            graphDto.setMaxConcentration(max);
            graphDto.setMinConcentration(min);
        }

        return graphDto;
    }

    // ✅ 평균 집중도 계산 (단일 값 반환)
    public Double calculateAverageConcentration(Long courseId, Long userId) {
        List<Concentration> concentrations = concentrationRepository
            .findByCourseIdAndUserIdOrderByTimelinePosition(courseId, userId);

        return concentrations.stream()
            .mapToDouble(Concentration::getScore)
            .average()
            .orElse(0.0);
    }
}
