package com.snapword.backend.word.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "words", indexes = {
        @Index(name = "idx_word_text_language", columnList = "text, language", unique = true)
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 항상 소문자로 정규화해서 저장 (사전 캐시 조회 키, language와 함께 복합 유니크) */
    @Column(nullable = false, length = 100)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private WordLanguage language = WordLanguage.EN;

    @Column(length = 30)
    private String partOfSpeech;

    @Column(length = 1000)
    private String definitionEn;

    @Column(length = 1000)
    private String definitionKo;

    @Column(length = 50)
    private String pronunciation;

    @Column(length = 500)
    private String example;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
