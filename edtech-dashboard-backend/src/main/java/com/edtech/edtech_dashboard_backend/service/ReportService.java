package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.dto.CourseReportDto;
import com.edtech.edtech_backend.model.*;
import com.edtech.edtech_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service // 비즈니스 로직 계층으로 등록
public class ReportService {

    @Autowired private CourseRepository courseRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private ConcentrationRepository concentrationRepository;
    @Autowired private AttendanceRepository attendanceRepository;

    // ✅ 전체 리포트 생성 (집중도, 출석률, 복습 이력 포함)
    public CourseReportDto generateCourseReport(Long courseId, Long userId) {
        // 1. 강의 존재 확인
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        // 2. 리포트 DTO 생성 및 기본 정보 설정
        CourseReportDto report = new CourseReportDto();
        report.setCourseId(courseId);
        report.setCourseTitle(course.getTitle());

        // 3. 복습 안 한 구간 목록
        List<CourseReportDto.UnreviewedSection> unreviewedSections = getUnreviewedSections(courseId, userId);
        report.setUnreviewedSections(unreviewedSections);

        // 4. 카테고리별 복습 시간 (바 그래프용)
        Map<String, Integer> categoryBarGraph = getCategoryBarGraphData(courseId, userId);
        report.setCategoryBarGraph(categoryBarGraph);

        // 5. 집중도 그래프 데이터
        List<CourseReportDto.ConcentrationPoint> concentrationGraph = getConcentrationGraphData(courseId, userId);
        report.setConcentrationGraph(concentrationGraph);

        // 6. 출석률 계산
        Double attendanceRate = calculateAttendanceRate(courseId, userId);
        report.setAttendanceRate(attendanceRate);

        // 7. 종합 요약 리포트 생성 (LLM 기반)
        String comprehensiveReport = generateComprehensiveReport(report);
        report.setComprehensiveReport(comprehensiveReport);

        return report;
    }

    // ✅ 복습하지 않은 구간 추출
    private List<CourseReportDto.UnreviewedSection> getUnreviewedSections(Long courseId, Long userId) {
        List<Review> unreviewedItems = reviewRepository
            .findByCourseIdAndUserIdAndIsReviewedFalse(courseId, userId);

        return unreviewedItems.stream()
            .map(r -> new CourseReportDto.UnreviewedSection(
                r.getTimelineStart(), r.getTimelineEnd(), r.getCategory()))
            .collect(Collectors.toList());
    }

    // ✅ 카테고리별 누적 복습 필요 시간 계산 (end - start 누적합)
    private Map<String, Integer> getCategoryBarGraphData(Long courseId, Long userId) {
        List<Review> unreviewedItems = reviewRepository
            .findByCourseIdAndUserIdAndIsReviewedFalse(courseId, userId);

        return unreviewedItems.stream()
            .collect(Collectors.groupingBy(
                Review::getCategory,
                Collectors.summingInt(r -> r.getTimelineEnd() - r.getTimelineStart())
            ));
    }

    // ✅ 집중도 그래프용 포인트 생성
    private List<CourseReportDto.ConcentrationPoint> getConcentrationGraphData(Long courseId, Long userId) {
        List<Concentration> concentrations = concentrationRepository
            .findByCourseIdAndUserIdOrderByTimelinePosition(courseId, userId);

        return concentrations.stream()
            .map(c -> new CourseReportDto.ConcentrationPoint(
                c.getTimelinePosition(), c.getScore()))
            .collect(Collectors.toList());
    }

    // ✅ 출석률 계산 (출석 횟수 / 전체 횟수 * 100)
    private Double calculateAttendanceRate(Long courseId, Long userId) {
        List<Attendance> attendances = attendanceRepository.findByCourseIdAndUserId(courseId, userId);

        if (attendances.isEmpty()) return 0.0;

        long attendedCount = attendances.stream()
            .mapToLong(a -> a.getIsPresent() ? 1 : 0)
            .sum();

        return (double) attendedCount / attendances.size() * 100;
    }

    // ✅ 종합 리포트 텍스트 생성 (LLM Prompt 기반)
    private String generateComprehensiveReport(CourseReportDto report) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("다음 학습 데이터를 바탕으로 학생의 종합 학습 보고서를 작성해주세요:\n");
        prompt.append("- 출석율: ").append(report.getAttendanceRate()).append("%\n");
        prompt.append("- 복습 필요 구간 수: ").append(report.getUnreviewedSections().size()).append("개\n");
        prompt.append("- 평균 집중도: ").append(calculateAverageConcentration(report.getConcentrationGraph())).append("\n");
        prompt.append("- 부족한 카테고리: ").append(getMostNeededCategories(report.getCategoryBarGraph())).append("\n");

        // 실제 LLM API 연동 부분은 구현 필요
        return callLLMAPI(prompt.toString());
    }

    // ✅ 평균 집중도 계산
    private Double calculateAverageConcentration(List<CourseReportDto.ConcentrationPoint> graph) {
        if (graph.isEmpty()) return 0.0;

        return graph.stream()
            .mapToDouble(CourseReportDto.ConcentrationPoint::getConcentrationScore)
            .average()
            .orElse(0.0);
    }

    // ✅ 가장 많은 복습이 필요한 카테고리 3개 추출
    private String getMostNeededCategories(Map<String, Integer> categoryBarGraph) {
        return categoryBarGraph.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(3)
            .map(Map.Entry::getKey)
            .collect(Collectors.joining(", "));
    }

    // ✅ (예정) LLM API 연동 위치
    private String callLLMAPI(String prompt) {
        // 실제 구현: OpenAI GPT 등 외부 API 호출 예정
        return "LLM 기반 종합 보고서가 여기에 생성됩니다. 실제 구현시 외부 API 호출 필요.";
    }
}
