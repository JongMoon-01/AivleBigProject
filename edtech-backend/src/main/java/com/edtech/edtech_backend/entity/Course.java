package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "course")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    @ManyToOne
    @JoinColumn(name = "classId")
    @JsonIgnore
    private ClassEntity classEntity;

    private String title;

    private String videoUrl;

    @OneToMany(mappedBy = "course")
    private List<Lecture> lectures;
}