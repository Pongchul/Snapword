package com.snapword.backend.book.dto;

import com.snapword.backend.word.domain.WordLanguage;

public record CreateBookRequest(
        String name,
        String description,
        WordLanguage language
) {}
