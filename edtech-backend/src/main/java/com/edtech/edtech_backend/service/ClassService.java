package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.dto.ClassDto;
import com.edtech.edtech_backend.entity.ClassEntity;
import com.edtech.edtech_backend.repository.ClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassService {

    private final ClassRepository classRepository;

    @Autowired
    public ClassService(ClassRepository classRepository) {
        this.classRepository = classRepository;
    }

    // 클래스 등록
    public ClassEntity createClass(ClassDto classDto) {
        ClassEntity newClass = new ClassEntity();
        newClass.setTitle(classDto.getTitle());
        newClass.setTag(classDto.getTag());
        newClass.setHeadcount(classDto.getHeadcount());

        return classRepository.save(newClass);
    }

    // 전체 클래스 조회
    public List<ClassEntity> getAllClasses() {
        return classRepository.findAll();
    }
}
