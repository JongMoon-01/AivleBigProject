package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.RandomButtonClickRequestDto;
import com.edtech.edtech_backend.entity.RandomButtonClick;
import com.edtech.edtech_backend.entity.CourseEngagementAnalytics;
import com.edtech.edtech_backend.entity.Lecture;
import com.edtech.edtech_backend.repository.RandomButtonClickRepository;
import com.edtech.edtech_backend.repository.CourseEngagementAnalyticsRepository;
import com.edtech.edtech_backend.repository.LectureRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/random-button")
@RequiredArgsConstructor
public class RandomButtonClickController {

    private final RandomButtonClickRepository clickRepository;
    private final LectureRepository lectureRepository;
    private final CourseEngagementAnalyticsRepository analyticsRepository;

    @PostMapping("/click")
    public ResponseEntity<Void> recordClick(@RequestBody RandomButtonClickRequestDto dto) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        RandomButtonClick click = new RandomButtonClick();
        click.setLectureId(dto.getLectureId());
        click.setUserId(userEmail);
        click.setButtonId(dto.getButtonId());
        click.setClicked(dto.isClicked());

        clickRepository.save(click);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/finalize/{lectureId}")
    public ResponseEntity<Void> finalizeFocusScore(@PathVariable Long lectureId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        List<RandomButtonClick> clicks = clickRepository.findByLectureIdAndUserId(lectureId, userEmail);

        long total = clicks.stream().map(RandomButtonClick::getButtonId).distinct().count();
        long clicked = clicks.stream().filter(RandomButtonClick::isClicked).count();

        double taskScore = (total == 0) ? 0.0 : (double) clicked / total;

        // 하드코딩된 가중치 계산
        double emotionScore = 0.8;
        double gazeScore = 0.9;
        double focusScore = 0.4 * emotionScore + 0.3 * gazeScore + 0.3 * taskScore;

        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow();

        CourseEngagementAnalytics analytics = new CourseEngagementAnalytics();
        analytics.setLecture(lecture);
        analytics.setUserId(userEmail);
        analytics.setFocusScore(focusScore);
        analytics.setReactionTimeAvg(0); // 추후 확장 가능
        analytics.setAttentionGraphData(null);

        analyticsRepository.save(analytics);
        return ResponseEntity.ok().build();
    }
}
