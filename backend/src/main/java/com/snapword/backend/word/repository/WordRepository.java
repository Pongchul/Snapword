package com.snapword.backend.word.repository;

import com.snapword.backend.word.domain.Word;
import com.snapword.backend.word.domain.WordLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WordRepository extends JpaRepository<Word, Long> {
    Optional<Word> findByTextIgnoreCaseAndLanguage(String text, WordLanguage language);

    /** 퀴즈 오답 선택지용 랜덤 단어 샘플링 (MySQL/H2 모두 RAND() 지원) */
    @Query(value = "SELECT * FROM words WHERE id != :excludeId AND definition_en IS NOT NULL ORDER BY RAND() LIMIT :count", nativeQuery = true)
    List<Word> findRandomExcluding(@Param("excludeId") Long excludeId, @Param("count") int count);
}
