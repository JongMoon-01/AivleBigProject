package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "class")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long classId;

    private String title;

    private String tag;

    private Integer headcount;

    @OneToMany(mappedBy = "classEntity")
    private List<Course> courses;

    @OneToMany(mappedBy = "classEntity")
    private List<Schedule> schedules;
}