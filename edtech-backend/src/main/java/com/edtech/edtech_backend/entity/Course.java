package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    private String title;
    private String materialUrl;
    private String tag;
    private String instructor;

    @ManyToOne
    @JoinColumn(name = "class_id")
    private ClassEntity classEntity;

}
