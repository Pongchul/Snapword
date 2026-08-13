package com.snapword.backend.word.infrastructure;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Optional;

/** 무료 영영사전 API(https://dictionaryapi.dev) 연동 클라이언트 */
@Slf4j
@Component
public class DictionaryClient {

    private final RestClient restClient;

    public DictionaryClient(@Value("${dictionary.api.base-url}") String baseUrl) {
        this.restClient = RestClient.create(baseUrl);
    }

    public Optional<DictionaryLookupResult> lookup(String text) {
        try {
            DictionaryApiEntry[] entries = restClient.get()
                    .uri("/{word}", text)
                    .retrieve()
                    .body(DictionaryApiEntry[].class);
            return Optional.ofNullable(entries)
                    .filter(e -> e.length > 0)
                    .map(e -> toResult(e[0]));
        } catch (RestClientResponseException e) {
            log.warn("사전 API 조회 실패: text={}, status={}", text, e.getStatusCode());
            return Optional.empty();
        }
    }

    private DictionaryLookupResult toResult(DictionaryApiEntry entry) {
        DictionaryApiEntry.Meaning meaning = entry.meanings() == null || entry.meanings().isEmpty()
                ? null : entry.meanings().get(0);
        DictionaryApiEntry.Definition definition = meaning == null || meaning.definitions() == null || meaning.definitions().isEmpty()
                ? null : meaning.definitions().get(0);

        return new DictionaryLookupResult(
                meaning == null ? null : meaning.partOfSpeech(),
                definition == null ? null : definition.definition(),
                entry.phonetic(),
                definition == null ? null : definition.example()
        );
    }
}
