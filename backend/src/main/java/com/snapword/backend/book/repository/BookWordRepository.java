package com.snapword.backend.book.repository;

import com.snapword.backend.book.domain.BookWord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookWordRepository extends JpaRepository<BookWord, Long> {
    List<BookWord> findByBookIdOrderByCreatedAtDesc(Long bookId);
    Optional<BookWord> findByIdAndBookId(Long id, Long bookId);
    boolean existsByBookIdAndWordId(Long bookId, Long wordId);
}
