package com.snapword.backend.book.repository;

import com.snapword.backend.book.domain.BookMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookMemberRepository extends JpaRepository<BookMember, Long> {
    List<BookMember> findByMemberIdOrderByJoinedAtDesc(Long memberId);
    Optional<BookMember> findByBookIdAndMemberId(Long bookId, Long memberId);
    boolean existsByBookIdAndMemberId(Long bookId, Long memberId);
    long countByBookId(Long bookId);
}
