package com.snapword.backend.review.domain;

import com.snapword.backend.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** 잔디(히트맵) 표시를 위한 회원별 일일 복습 활동 집계 */
@Entity
@Table(name = "review_activities", uniqueConstraints = {
        @UniqueConstraint(name = "uk_review_activity_member_date", columnNames = {"member_id", "activity_date"})
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private LocalDate activityDate;

    @Column(nullable = false)
    @Builder.Default
    private int count = 0;
}
