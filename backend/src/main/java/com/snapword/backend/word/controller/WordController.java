package com.snapword.backend.word.controller;

import com.snapword.backend.word.domain.WordLanguage;
import com.snapword.backend.word.dto.UpdateWordDefinitionRequest;
import com.snapword.backend.word.dto.WordDto;
import com.snapword.backend.word.exception.WordLookupFailedException;
import com.snapword.backend.word.service.WordLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/words")
@RequiredArgsConstructor
public class WordController {

    private final WordLookupService wordLookupService;

    /** OCR로 인식한 단어의 뜻/발음을 조회(캐시 miss 시 외부 사전·번역 API 호출 후 저장) */
    @GetMapping("/lookup")
    public ResponseEntity<WordDto> lookup(
            @RequestParam String text,
            @RequestParam(defaultValue = "EN") WordLanguage language
    ) {
        return ResponseEntity.ok(wordLookupService.lookup(text, language));
    }

    /** 사용자가 자동/번역으로 채워진 뜻을 직접 추가하거나 고칠 수 있게 함 */
    @PatchMapping("/{wordId}")
    public ResponseEntity<WordDto> updateDefinition(
            @PathVariable Long wordId,
            @RequestBody UpdateWordDefinitionRequest request
    ) {
        return ResponseEntity.ok(wordLookupService.updateDefinition(wordId, request.definitionKo()));
    }

    @ExceptionHandler(WordLookupFailedException.class)
    public ResponseEntity<String> handleLookupFailed(WordLookupFailedException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }
}
