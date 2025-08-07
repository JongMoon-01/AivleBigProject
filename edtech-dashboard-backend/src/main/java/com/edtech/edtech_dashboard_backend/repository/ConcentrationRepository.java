package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.model.Concentration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository // 스프링이 이 인터페이스를 레포지토리로 인식하게 함
public interface ConcentrationRepository extends JpaRepository<Concentration, Long> {

    // ✅ 특정 강의와 사용자에 대한 집중도 데이터 전체를 타임라인 순서대로 조회
    List<Concentration> findByCourseIdAndUserIdOrderByTimelinePosition(Long courseId, Long userId);

    // ✅ 특정 사용자의 모든 집중도 데이터 조회
    List<Concentration> findByUserId(Long userId);

    // ✅ 특정 강의의 모든 집중도 데이터 조회
    List<Concentration> findByCourseId(Long courseId);
}
