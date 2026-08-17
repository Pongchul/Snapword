package com.snapword.backend.review.repository;

import com.snapword.backend.review.domain.ReviewProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewProgressRepository extends JpaRepository<ReviewProgress, Long> {
    Optional<ReviewProgress> findByMemberIdAndBookWordId(Long memberId, Long bookWordId);
    List<ReviewProgress> findByMemberIdAndBookWord_Book_Id(Long memberId, Long bookId);
    void deleteByBookWordId(Long bookWordId);
}
