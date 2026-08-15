package com.snapword.backend.review.repository;

import com.snapword.backend.review.domain.ReviewActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReviewActivityRepository extends JpaRepository<ReviewActivity, Long> {
    Optional<ReviewActivity> findByMemberIdAndActivityDate(Long memberId, LocalDate activityDate);

    List<ReviewActivity> findByMemberIdAndActivityDateGreaterThanEqualOrderByActivityDateAsc(
            Long memberId, LocalDate from);
}
