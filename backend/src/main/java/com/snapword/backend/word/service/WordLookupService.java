package com.snapword.backend.word.service;

import com.snapword.backend.word.domain.Word;
import com.snapword.backend.word.domain.WordLanguage;
import com.snapword.backend.word.dto.WordDto;
import com.snapword.backend.word.exception.WordLookupFailedException;
import com.snapword.backend.word.infrastructure.DictionaryClient;
import com.snapword.backend.word.infrastructure.DictionaryLookupResult;
import com.snapword.backend.word.infrastructure.JishoClient;
import com.snapword.backend.word.infrastructure.TranslationClient;
import com.snapword.backend.word.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WordLookupService {

    private final WordRepository wordRepository;
    private final DictionaryClient dictionaryClient;
    private final JishoClient jishoClient;
    private final TranslationClient translationClient;

    @Transactional
    public WordDto lookup(String rawText, WordLanguage language) {
        if (rawText == null || rawText.isBlank()) {
            throw new IllegalArgumentException("조회할 단어를 입력해주세요.");
        }
        String normalized = rawText.trim().toLowerCase();

        return wordRepository.findByTextIgnoreCaseAndLanguage(normalized, language)
                .map(this::toDto)
                .orElseGet(() -> fetchAndCache(normalized, language));
    }

    private WordDto fetchAndCache(String normalized, WordLanguage language) {
        DictionaryLookupResult result = (language == WordLanguage.JA
                ? jishoClient.lookup(normalized)
                : dictionaryClient.lookup(normalized))
                .orElseThrow(() -> new WordLookupFailedException(normalized));
        String definitionKo = translationClient.translateToKorean(result.definitionEn()).orElse(null);

        Word word = Word.builder()
                .text(normalized)
                .language(language)
                .partOfSpeech(result.partOfSpeech())
                .definitionEn(result.definitionEn())
                .definitionKo(definitionKo)
                .pronunciation(result.pronunciation())
                .example(result.example())
                .build();

        Word saved = wordRepository.save(word);
        return toDto(saved);
    }

    @Transactional
    public WordDto updateDefinition(Long wordId, String definitionKo) {
        if (definitionKo == null || definitionKo.isBlank()) {
            throw new IllegalArgumentException("뜻을 입력해주세요.");
        }
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 단어입니다: " + wordId));
        word.setDefinitionKo(definitionKo.trim());
        return toDto(word);
    }

    private WordDto toDto(Word word) {
        return new WordDto(
                word.getId(),
                word.getText(),
                word.getLanguage(),
                word.getPartOfSpeech(),
                word.getDefinitionEn(),
                word.getDefinitionKo(),
                word.getPronunciation(),
                word.getExample()
        );
    }
}
