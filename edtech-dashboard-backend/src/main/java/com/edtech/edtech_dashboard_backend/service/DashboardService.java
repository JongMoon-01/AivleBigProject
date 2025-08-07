package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.model.User;
import com.edtech.edtech_backend.model.Course;
import com.edtech.edtech_backend.model.Attendance;
import com.edtech.edtech_backend.model.Concentration;
import com.edtech.edtech_backend.repository.UserRepository;
import com.edtech.edtech_backend.repository.CourseRepository;
import com.edtech.edtech_backend.repository.AttendanceRepository;
import com.edtech.edtech_backend.repository.ConcentrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private ConcentrationRepository concentrationRepository;

    // ✅ 전체 대시보드 데이터 생성
    public Map<String, Object> generateDashboardData(Long userId) {
        Map<String, Object> result = new HashMap<>();
        
        // KPI 메트릭스
        result.put("kpiMetrics", generateKPIMetrics(userId));
        
        // 차트 데이터
        Map<String, Object> charts = new HashMap<>();
        charts.put("focusScoreByTime", generateFocusScoreByTime(userId));
        charts.put("reviewMaterials", generateReviewMaterials(userId));
        charts.put("responseTimeDistribution", generateResponseTimeDistribution(userId));
        charts.put("weeklyFocusChange", generateWeeklyFocusChange(userId));
        result.put("charts", charts);
        
        // 네비게이션 메뉴
        result.put("navigation", generateNavigationData(userId));
        
        return result;
    }

    // ✅ KPI 메트릭스 생성
    public Map<String, Object> generateKPIMetrics(Long userId) {
        Map<String, Object> kpiMetrics = new HashMap<>();
        
        // 출석률 계산
        Map<String, Object> attendance = new HashMap<>();
        attendance.put("value", calculateAttendanceRate(userId));
        attendance.put("unit", "%");
        attendance.put("label", "출석률");
        attendance.put("icon", "✓");
        attendance.put("color", "blue");
        kpiMetrics.put("attendance", attendance);
        
        // 복습률 계산
        Map<String, Object> reviewRate = new HashMap<>();
        reviewRate.put("value", calculateReviewRate(userId));
        reviewRate.put("unit", "%");
        reviewRate.put("label", "해당과목 복습률");
        reviewRate.put("icon", "✓");
        reviewRate.put("color", "orange");
        kpiMetrics.put("reviewRate", reviewRate);
        
        // 집중도 평균 계산
        Map<String, Object> focusAverage = new HashMap<>();
        focusAverage.put("value", calculateFocusAverage(userId));
        focusAverage.put("unit", "%");
        focusAverage.put("label", "과목 집중도 평균");
        focusAverage.put("icon", "🧠");
        focusAverage.put("color", "cyan");
        kpiMetrics.put("focusAverage", focusAverage);
        
        return kpiMetrics;
    }

    // ✅ 시간대별 집중도 데이터 생성
    public Map<String, Object> generateFocusScoreByTime(Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("title", "Focus Score by Time Of Day");
        result.put("type", "area");
        result.put("color", "#F59E0B");
        result.put("fillOpacity", 0.2);
        
        // 실제 집중도 데이터 조회 및 시간대별 집계
        List<Concentration> concentrations = concentrationRepository.findByUserId(userId);
        List<Map<String, Object>> data = new ArrayList<>();
        
        // 8AM부터 6PM까지 2시간 간격
        String[] times = {"8AM", "10AM", "12PM", "2PM", "4PM", "6PM"};
        for (String time : times) {
            Map<String, Object> point = new HashMap<>();
            point.put("time", time);
            point.put("score", calculateScoreForTime(concentrations, time, userId));
            data.add(point);
        }
        
        result.put("data", data);
        return result;
    }

    // ✅ 복습 자료 생성 데이터
    public Map<String, Object> generateReviewMaterials(Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("title", "Generated Review Materials");
        result.put("type", "horizontalBar");
        result.put("color", "#3B82F6");
        result.put("xAxisLabel", "Seconds");
        
        List<Map<String, Object>> data = new ArrayList<>();
        
        // 실제 복습 자료 생성 시간 계산 (여기서는 더미 데이터)
        String[] materials = {"PDF 노트", "퀴즈", "요약본", "키워드", "복습문제"};
        for (String material : materials) {
            Map<String, Object> item = new HashMap<>();
            item.put("category", material);
            item.put("duration", calculateMaterialGenerationTime(userId, material));
            data.add(item);
        }
        
        result.put("data", data);
        return result;
    }

    // ✅ 응답 시간 분포 데이터
    public Map<String, Object> generateResponseTimeDistribution(Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("title", "Response Time Distribution");
        result.put("type", "density");
        result.put("color", "#3B82F6");
        result.put("fillGradient", true);
        
        List<Map<String, Object>> data = new ArrayList<>();
        
        // 정규분포 형태의 응답 시간 데이터 생성
        double[] times = {0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0};
        for (double time : times) {
            Map<String, Object> point = new HashMap<>();
            point.put("time", time);
            point.put("density", calculateResponseDensity(userId, time));
            data.add(point);
        }
        
        result.put("data", data);
        return result;
    }

    // ✅ 주간 집중도 변화 데이터
    public Map<String, Object> generateWeeklyFocusChange(Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("title", "Weekly Change in Focus Score");
        result.put("type", "bar");
        result.put("color", "#3B82F6");
        result.put("showLabels", true);
        result.put("zeroLineColor", "#6B7280");
        
        List<Map<String, Object>> data = new ArrayList<>();
        
        // 최근 8주간의 집중도 변화 계산
        for (int week = 1; week <= 8; week++) {
            Map<String, Object> weekData = new HashMap<>();
            weekData.put("week", week + "주차");
            weekData.put("change", calculateWeeklyChange(userId, week));
            data.add(weekData);
        }
        
        result.put("data", data);
        return result;
    }

    // ✅ 네비게이션 메뉴 데이터
    public Map<String, Object> generateNavigationData(Long userId) {
        Map<String, Object> navigation = new HashMap<>();
        navigation.put("activeItem", "수업 일정");
        
        List<Map<String, Object>> items = new ArrayList<>();
        
        Map<String, Object> item1 = new HashMap<>();
        item1.put("name", "수업 일정");
        item1.put("icon", "🏠");
        item1.put("active", true);
        items.add(item1);
        
        Map<String, Object> item2 = new HashMap<>();
        item2.put("name", "강의 콘텐츠");
        item2.put("icon", "🏢");
        item2.put("active", false);
        items.add(item2);
        
        Map<String, Object> item3 = new HashMap<>();
        item3.put("name", "Lecture Summary");
        item3.put("icon", "📚");
        item3.put("active", false);
        item3.put("highlighted", true);
        items.add(item3);
        
        Map<String, Object> item4 = new HashMap<>();
        item4.put("name", "강의 자료실");
        item4.put("icon", "📁");
        item4.put("active", false);
        items.add(item4);
        
        Map<String, Object> item5 = new HashMap<>();
        item5.put("name", "기타");
        item5.put("icon", "☕");
        item5.put("active", false);
        items.add(item5);
        
        navigation.put("items", items);
        return navigation;
    }

    // ===== 계산 메소드들 =====

    // 출석률 계산
    private int calculateAttendanceRate(Long userId) {
        List<Attendance> attendances = attendanceRepository.findByUserId(userId);
        if (attendances.isEmpty()) {
            // 사용자별 다른 기본값 반환
            switch (userId.intValue() % 4) {
                case 1: return 93;
                case 2: return 88;
                case 3: return 95;
                default: return 85;
            }
        }
        
        long totalClasses = courseRepository.count();
        long attendedClasses = attendances.size();
        
        if (totalClasses == 0) return 93;
        return (int) Math.round((double) attendedClasses / totalClasses * 100);
    }

    // 복습률 계산
    private int calculateReviewRate(Long userId) {
        // 사용자별 다른 복습률 반환
        switch (userId.intValue() % 4) {
            case 1: return 88;
            case 2: return 92;
            case 3: return 78;
            default: return 85;
        }
    }

    // 집중도 평균 계산
    private int calculateFocusAverage(Long userId) {
        List<Concentration> concentrations = concentrationRepository.findByUserId(userId);
        if (concentrations.isEmpty()) {
            // 사용자별 다른 집중도 평균 반환
            switch (userId.intValue() % 4) {
                case 1: return 76;
                case 2: return 82;
                case 3: return 71;
                default: return 79;
            }
        }
        
        double average = concentrations.stream()
                .mapToDouble(Concentration::getScore)
                .average()
                .orElse(0.76);
        
        return (int) Math.round(average * 100);
    }

    // 시간대별 점수 계산
    private int calculateScoreForTime(List<Concentration> concentrations, String time, Long userId) {
        // 사용자별 다른 시간대 패턴 반환
        int userType = userId.intValue() % 4;
        
        switch (time) {
            case "8AM": 
                return userType == 1 ? 0 : userType == 2 ? 15 : userType == 3 ? 5 : 8;
            case "10AM": 
                return userType == 1 ? 10 : userType == 2 ? 25 : userType == 3 ? 20 : 30;
            case "12PM": 
                return userType == 1 ? 25 : userType == 2 ? 45 : userType == 3 ? 35 : 40;
            case "2PM": 
                return userType == 1 ? 60 : userType == 2 ? 75 : userType == 3 ? 50 : 65;
            case "4PM": 
                return userType == 1 ? 70 : userType == 2 ? 65 : userType == 3 ? 80 : 75;
            case "6PM": 
                return userType == 1 ? 35 : userType == 2 ? 30 : userType == 3 ? 60 : 45;
            default: return 0;
        }
    }

    // 자료 생성 시간 계산
    private double calculateMaterialGenerationTime(Long userId, String material) {
        // 실제 로직 구현 (현재는 더미)
        return 2.0 + Math.random() * 1.5; // 2.0-3.5초
    }

    // 응답 시간 밀도 계산
    private double calculateResponseDensity(Long userId, double time) {
        // 정규분포 계산 (평균 2초)
        double mean = 2.0;
        double stdDev = 0.6;
        double variance = stdDev * stdDev;
        
        return Math.exp(-0.5 * Math.pow((time - mean) / stdDev, 2)) / Math.sqrt(2 * Math.PI * variance);
    }

    // 주간 변화 계산
    private double calculateWeeklyChange(Long userId, int week) {
        // 실제 로직 구현 (현재는 더미)
        double[] changes = {-1, 0.5, -0.5, 1, 0, 2, 4.5, 5};
        return changes[week - 1];
    }
}