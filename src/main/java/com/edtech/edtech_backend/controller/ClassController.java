package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.ClassRegisterRequestDto;
import com.edtech.edtech_backend.entity.ClassEntity;
import com.edtech.edtech_backend.repository.ClassRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassRepository classRepository;

    @PostMapping
    public void registerClass(@RequestBody ClassRegisterRequestDto requestDto) {
        ClassEntity newClass = new ClassEntity();
        newClass.setTitle(requestDto.getTitle());
        newClass.setTag(requestDto.getTag());
        newClass.setHeadcount(requestDto.getHeadcount());
        classRepository.save(newClass);
    }
    @GetMapping
    public List<ClassEntity> getAllClasses() {
        return classRepository.findAll();
    }
}
