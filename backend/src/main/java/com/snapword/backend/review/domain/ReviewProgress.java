package com.snapword.backend.review.domain;

import com.snapword.backend.book.domain.BookWord;
import com.snapword.backend.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** 단어장은 여러 명이 공유할 수 있어서, 복습 진행 상태는 (member, bookWord) 단위로 각자 따로 갖는다 */
@Entity
@Table(name = "review_progresses", uniqueConstraints = {
        @UniqueConstraint(name = "uk_review_member_bookword", columnNames = {"member_id", "book_word_id"})
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_word_id", nullable = false)
    private BookWord bookWord;

    @Column(nullable = false)
    @Builder.Default
    private double easeFactor = 2.5;

    @Column(nullable = false)
    @Builder.Default
    private int intervalDays = 0;

    @Column(nullable = false)
    @Builder.Default
    private int repetitions = 0;

    @Column(nullable = false)
    private LocalDateTime nextReviewAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }
}
