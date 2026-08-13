package com.snapword.backend.word.infrastructure;

public record DictionaryLookupResult(
        String partOfSpeech,
        String definitionEn,
        String pronunciation,
        String example
) {}
