package com.snapword.backend.word.dto;

import com.snapword.backend.word.domain.WordLanguage;

public record CreateManualWordRequest(String text, WordLanguage language, String definitionKo) {}
