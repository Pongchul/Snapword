package com.snapword.backend.book.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** 사용자가 직접 추가하는, 해당 단어장 안에서만 보이는 커스텀 뜻 */
@Entity
@Table(name = "book_word_definitions")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookWordDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_word_id", nullable = false)
    private BookWord bookWord;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
