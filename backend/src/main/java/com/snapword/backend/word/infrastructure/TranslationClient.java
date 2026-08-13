package com.snapword.backend.word.infrastructure;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Optional;

/**
 * 네이버 클라우드 플랫폼 파파고 번역 API 연동 클라이언트.
 * client-id/client-secret이 설정돼 있지 않으면(로컬 개발 등) 번역을 건너뛰고 Optional.empty()를 반환한다
 * — 이 경우 영영 뜻만 저장/노출된다.
 */
@Slf4j
@Component
public class TranslationClient {

    private final RestClient restClient;
    private final String clientId;
    private final String clientSecret;
    private final boolean enabled;

    public TranslationClient(
            @Value("${translation.api.base-url}") String baseUrl,
            @Value("${translation.api.client-id}") String clientId,
            @Value("${translation.api.client-secret}") String clientSecret
    ) {
        this.enabled = baseUrl != null && !baseUrl.isBlank()
                && clientId != null && !clientId.isBlank()
                && clientSecret != null && !clientSecret.isBlank();
        this.restClient = enabled ? RestClient.create(baseUrl) : null;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public Optional<String> translateToKorean(String text) {
        if (!enabled || text == null || text.isBlank()) {
            return Optional.empty();
        }
        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("source", "en");
            form.add("target", "ko");
            form.add("text", text);

            PapagoResponse response = restClient.post()
                    .header("X-NCP-APIGW-API-KEY-ID", clientId)
                    .header("X-NCP-APIGW-API-KEY", clientSecret)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(PapagoResponse.class);

            return Optional.ofNullable(response)
                    .map(PapagoResponse::message)
                    .map(Message::result)
                    .map(Result::translatedText);
        } catch (RestClientResponseException e) {
            log.warn("파파고 번역 API 호출 실패: status={}", e.getStatusCode());
            return Optional.empty();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record PapagoResponse(Message message) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Message(Result result) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Result(String translatedText) {}
}
