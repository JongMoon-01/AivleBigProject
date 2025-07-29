package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.ClassDto;
import com.edtech.edtech_backend.entity.ClassEntity;
import com.edtech.edtech_backend.service.ClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/class")
@CrossOrigin(origins = "*")  // CORS 허용
public class ClassController {

    private final ClassService classService;

    @Autowired
    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    // 클래스 등록
    @PostMapping
    public ClassEntity createClass(@RequestBody ClassDto classDto) {
        return classService.createClass(classDto);
    }

    // 클래스 전체 조회
    @GetMapping
    public List<ClassEntity> getAllClasses() {
        return classService.getAllClasses();
    }
}