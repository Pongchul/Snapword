package com.snapword.backend.word.dto;

import com.snapword.backend.word.domain.WordLanguage;

public record WordDto(
        Long id,
        String text,
        WordLanguage language,
        String partOfSpeech,
        String definitionEn,
        String definitionKo,
        String pronunciation,
        String example
) {}
