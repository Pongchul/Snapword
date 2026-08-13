package com.snapword.backend.word.infrastructure;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Optional;

/** 무료 일본어 사전 API(https://jisho.org/api/v1/search/words) 연동 클라이언트 */
@Slf4j
@Component
public class JishoClient {

    private final RestClient restClient;

    public JishoClient(@Value("${jisho.api.base-url}") String baseUrl) {
        this.restClient = RestClient.create(baseUrl);
    }

    public Optional<DictionaryLookupResult> lookup(String text) {
        try {
            JishoResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder.queryParam("keyword", text).build())
                    .retrieve()
                    .body(JishoResponse.class);
            return Optional.ofNullable(response)
                    .map(JishoResponse::data)
                    .filter(entries -> entries != null && !entries.isEmpty())
                    .map(entries -> toResult(entries.get(0)));
        } catch (RestClientResponseException e) {
            log.warn("Jisho API 조회 실패: text={}, status={}", text, e.getStatusCode());
            return Optional.empty();
        }
    }

    private DictionaryLookupResult toResult(JishoApiEntry entry) {
        JishoApiEntry.Japanese japanese = entry.japanese() == null || entry.japanese().isEmpty()
                ? null : entry.japanese().get(0);
        JishoApiEntry.Sense sense = entry.senses() == null || entry.senses().isEmpty()
                ? null : entry.senses().get(0);

        String partOfSpeech = sense == null || sense.partsOfSpeech() == null || sense.partsOfSpeech().isEmpty()
                ? null : sense.partsOfSpeech().get(0);
        String definitionEn = sense == null || sense.englishDefinitions() == null || sense.englishDefinitions().isEmpty()
                ? null : String.join(", ", sense.englishDefinitions());
        String reading = japanese == null ? null : japanese.reading();

        return new DictionaryLookupResult(partOfSpeech, definitionEn, reading, null);
    }
}
