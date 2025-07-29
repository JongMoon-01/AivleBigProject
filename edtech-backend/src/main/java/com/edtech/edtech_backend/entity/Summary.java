package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "summary")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Summary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long summaryId;

    @ManyToOne
    @JoinColumn(name = "lecture_id")
    private Lecture lecture;

    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;
}