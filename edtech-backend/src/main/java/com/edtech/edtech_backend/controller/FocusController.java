// src/main/java/com/edtech/edtech_backend/controller/FocusController.java
package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.FocusDto;
import com.edtech.edtech_backend.entity.ClassEntity;
import com.edtech.edtech_backend.entity.CourseEngagementAnalytics;
import com.edtech.edtech_backend.entity.FocusInterval;
import com.edtech.edtech_backend.repository.ClassRepository;
import com.edtech.edtech_backend.repository.CourseEngagementAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/focus")
@RequiredArgsConstructor
public class FocusController {

    private final ClassRepository classRepository;
    private final CourseEngagementAnalyticsRepository analyticsRepository;

    @PostMapping("/intervals")
    public ResponseEntity<FocusDto.SaveResponse> saveIntervals(
            Authentication authentication,                 // ✅ 인증객체 통째로 받기
            @RequestBody FocusDto.SessionPayload payload
    ) {
        // 0) 인증 확인 + userId 추출
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 필요");
        }
        String userId = resolveUserId(authentication);
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유저 식별 불가");
        }

        CourseEngagementAnalytics entity = new CourseEngagementAnalytics();

        // 1) classId -> ClassEntity
        if (payload.getClassId() != null) {
            ClassEntity clazz = classRepository.findById(payload.getClassId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "classId not found: " + payload.getClassId()));
            entity.setClassEntity(clazz);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classId 누락");
        }

        // 2) 필드 세팅 (userId는 프론트값 무시하고 인증값 사용)
        entity.setCourseId(payload.getCourseId());
        entity.setUserId(userId);

        if (payload.getStartedAt() != null) {
            entity.setStartedAt(Instant.ofEpochMilli(payload.getStartedAt()));
        }
        if (payload.getEndedAt() != null) {
            entity.setEndedAt(Instant.ofEpochMilli(payload.getEndedAt()));
        }
        entity.setTotalDurationSec(payload.getTotalDurationSec());

        // 3) intervals 매핑
        if (payload.getIntervals() != null && !payload.getIntervals().isEmpty()) {
            entity.setAttentionArr(
                    payload.getIntervals().stream().map(ip -> {
                        FocusInterval fi = new FocusInterval();
                        fi.setStartAt(Instant.ofEpochMilli(ip.getStart()));
                        fi.setEndAt(Instant.ofEpochMilli(ip.getEnd()));
                        fi.setDurationSec(ip.getDurationSec());
                        fi.setAvgScore(ip.getAvgScore());
                        return fi;
                    }).collect(Collectors.toList())
            );
        }

        Long id = analyticsRepository.save(entity).getCourseAnalyticsId();
        return ResponseEntity.ok(new FocusDto.SaveResponse(id));
    }

    private String resolveUserId(Authentication auth) {
        Object p = auth.getPrincipal();
        if (p instanceof UserDetails ud) return ud.getUsername();
        if (p instanceof Jwt jwt) {
            String email = jwt.getClaimAsString("email");
            return (email != null && !email.isBlank()) ? email : jwt.getSubject();
        }
        if (p instanceof String s) return s;     // ex) principal이 문자열인 커스텀 토큰
        return auth.getName();                   // 마지막 fallback
    }
    @GetMapping("/intervals/latest")
@Transactional(readOnly = true)
public ResponseEntity<FocusDto.LatestView> getLatest(
        @RequestParam Long classId,
        @RequestParam Long courseId,
        Authentication auth
) {
    if (auth == null || !auth.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    String userId = resolveUserId(auth);
    var opt = analyticsRepository.findLatest(classId, courseId, userId);
    if (opt.isEmpty()) return ResponseEntity.noContent().build();

    var cea = opt.get();
    if (cea.getAttentionArr() == null || cea.getAttentionArr().isEmpty()) {
        return ResponseEntity.noContent().build();
    }

    var view = new FocusDto.LatestView();
    // startedAt 없을 수도 있으니 보정
    var started = cea.getStartedAt();
    if (started == null && cea.getAttentionArr().get(0).getStartAt() != null) {
        started = cea.getAttentionArr().get(0).getStartAt();
    }
    view.setStartedAt(started);

    var intervals = cea.getAttentionArr().stream().map(fi -> {
        var iv = new FocusDto.IntervalView();
        iv.setStart(fi.getStartAt() != null ? fi.getStartAt().toEpochMilli() : 0L);
        iv.setEnd(fi.getEndAt() != null ? fi.getEndAt().toEpochMilli() : iv.getStart());
        iv.setDurationSec(fi.getDurationSec());
        iv.setAvgScore(fi.getAvgScore());
        return iv;
    }).collect(Collectors.toList());
    view.setIntervals(intervals);

    return ResponseEntity.ok(view);
}
}
