package com.snapword.backend.book.repository;

import com.snapword.backend.book.domain.BookWordDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookWordDefinitionRepository extends JpaRepository<BookWordDefinition, Long> {
    List<BookWordDefinition> findByBookWordIdOrderByCreatedAtAsc(Long bookWordId);
    Optional<BookWordDefinition> findByIdAndBookWordId(Long id, Long bookWordId);
    void deleteByBookWordId(Long bookWordId);
}
