package com.snapword.backend.word.infrastructure;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/** https://jisho.org/api/v1/search/words 응답 형식 (필요한 필드만 매핑) */
@JsonIgnoreProperties(ignoreUnknown = true)
public record JishoApiEntry(
        List<Japanese> japanese,
        List<Sense> senses
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Japanese(String word, String reading) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Sense(
            @JsonProperty("english_definitions") List<String> englishDefinitions,
            @JsonProperty("parts_of_speech") List<String> partsOfSpeech
    ) {}
}
