package com.snapword.backend.word.infrastructure;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/** https://api.dictionaryapi.dev 응답 형식 (필요한 필드만 매핑) */
@JsonIgnoreProperties(ignoreUnknown = true)
public record DictionaryApiEntry(
        String word,
        String phonetic,
        List<Meaning> meanings
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Meaning(String partOfSpeech, List<Definition> definitions) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Definition(String definition, String example) {}
}
