package com.snapword.backend.book.dto;

import com.snapword.backend.book.domain.BookRole;
import com.snapword.backend.book.domain.BookVisibility;
import com.snapword.backend.word.domain.WordLanguage;

import java.time.LocalDateTime;

public record BookDto(
        Long id,
        String name,
        String description,
        BookVisibility visibility,
        WordLanguage language,
        BookRole myRole,
        long memberCount,
        LocalDateTime createdAt
) {}
