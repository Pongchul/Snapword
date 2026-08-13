package com.snapword.backend.book.service;

import com.snapword.backend.book.domain.BookMember;
import com.snapword.backend.book.domain.BookWord;
import com.snapword.backend.book.dto.AddBookWordRequest;
import com.snapword.backend.book.dto.BookWordDto;
import com.snapword.backend.book.exception.ForbiddenBookAccessException;
import com.snapword.backend.book.repository.BookWordRepository;
import com.snapword.backend.member.domain.Member;
import com.snapword.backend.member.repository.MemberRepository;
import com.snapword.backend.word.domain.Word;
import com.snapword.backend.word.dto.WordDto;
import com.snapword.backend.word.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookWordService {

    private final BookService bookService;
    private final BookWordRepository bookWordRepository;
    private final WordRepository wordRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public BookWordDto addWord(Long bookId, Long memberId, AddBookWordRequest request) {
        BookMember membership = bookService.requireMembership(bookId, memberId);
        requireEditPermission(membership);

        if (bookWordRepository.existsByBookIdAndWordId(bookId, request.wordId())) {
            throw new IllegalArgumentException("이미 단어장에 추가된 단어입니다.");
        }

        Word word = wordRepository.findById(request.wordId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 단어입니다: " + request.wordId()));
        Member addedBy = memberRepository.findById(memberId).orElseThrow();

        BookWord saved = bookWordRepository.save(BookWord.builder()
                .book(membership.getBook())
                .word(word)
                .addedBy(addedBy)
                .note(request.note())
                .build());

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BookWordDto> getWords(Long bookId, Long memberId) {
        bookService.requireMembership(bookId, memberId);
        return bookWordRepository.findByBookIdOrderByCreatedAtDesc(bookId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void removeWord(Long bookId, Long bookWordId, Long memberId) {
        BookMember membership = bookService.requireMembership(bookId, memberId);
        requireEditPermission(membership);

        BookWord bookWord = bookWordRepository.findByIdAndBookId(bookWordId, bookId)
                .orElseThrow(() -> new IllegalArgumentException("단어장에 없는 단어입니다: " + bookWordId));
        bookWordRepository.delete(bookWord);
    }

    private void requireEditPermission(BookMember membership) {
        if (!membership.getRole().canEdit()) {
            throw new ForbiddenBookAccessException("단어를 추가/삭제할 권한이 없습니다.");
        }
    }

    private BookWordDto toDto(BookWord bookWord) {
        Word word = bookWord.getWord();
        WordDto wordDto = new WordDto(
                word.getId(), word.getText(), word.getLanguage(), word.getPartOfSpeech(),
                word.getDefinitionEn(), word.getDefinitionKo(), word.getPronunciation(), word.getExample()
        );
        return new BookWordDto(
                bookWord.getId(),
                wordDto,
                bookWord.getNote(),
                bookWord.getAddedBy().getNickname(),
                bookWord.getCreatedAt()
        );
    }
}
