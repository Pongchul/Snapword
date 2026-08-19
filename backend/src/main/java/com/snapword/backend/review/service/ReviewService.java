package com.snapword.backend.review.service;

import com.snapword.backend.book.domain.BookWord;
import com.snapword.backend.book.repository.BookWordRepository;
import com.snapword.backend.book.service.BookService;
import com.snapword.backend.member.repository.MemberRepository;
import com.snapword.backend.review.domain.ReviewActivity;
import com.snapword.backend.review.domain.ReviewProgress;
import com.snapword.backend.review.dto.QuizQuestionDto;
import com.snapword.backend.review.dto.ReviewActivityDto;
import com.snapword.backend.review.dto.ReviewProgressDto;
import com.snapword.backend.review.repository.ReviewActivityRepository;
import com.snapword.backend.review.repository.ReviewProgressRepository;
import com.snapword.backend.word.domain.Word;
import com.snapword.backend.word.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** SM-2를 단순화한 간격 반복(SRS) 스케줄링 */
@Service
@RequiredArgsConstructor
public class ReviewService {

    private static final int QUEUE_LIMIT = 20;
    private static final int CHOICE_COUNT = 4;
    private static final double MIN_EASE_FACTOR = 1.3;

    private final BookService bookService;
    private final BookWordRepository bookWordRepository;
    private final WordRepository wordRepository;
    private final ReviewProgressRepository reviewProgressRepository;
    private final ReviewActivityRepository reviewActivityRepository;
    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<QuizQuestionDto> getQueue(Long bookId, Long memberId) {
        bookService.requireMembership(bookId, memberId);

        List<BookWord> bookWords = bookWordRepository.findByBookIdOrderByCreatedAtDesc(bookId);
        Map<Long, ReviewProgress> progressByBookWordId = reviewProgressRepository
                .findByMemberIdAndBookWord_Book_Id(memberId, bookId).stream()
                .collect(Collectors.toMap(p -> p.getBookWord().getId(), p -> p));

        LocalDateTime now = LocalDateTime.now();

        return bookWords.stream()
                .filter(bw -> isDue(progressByBookWordId.get(bw.getId()), now))
                .map(this::buildQuizQuestion)
                .filter(q -> q.choices().size() == CHOICE_COUNT)
                .limit(QUEUE_LIMIT)
                .toList();
    }

    @Transactional
    public ReviewProgressDto submitResult(Long bookWordId, Long memberId, boolean correct) {
        BookWord bookWord = bookWordRepository.findById(bookWordId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 단어장 항목입니다: " + bookWordId));
        bookService.requireMembership(bookWord.getBook().getId(), memberId);

        ReviewProgress progress = reviewProgressRepository.findByMemberIdAndBookWordId(memberId, bookWordId)
                .orElseGet(() -> ReviewProgress.builder()
                        .member(memberRepository.getReferenceById(memberId))
                        .bookWord(bookWord)
                        .nextReviewAt(LocalDateTime.now())
                        .build());

        applySm2(progress, correct);
        ReviewProgress saved = reviewProgressRepository.save(progress);
        recordActivity(memberId);

        return new ReviewProgressDto(
                bookWordId, saved.getRepetitions(), saved.getIntervalDays(),
                saved.getEaseFactor(), saved.getNextReviewAt()
        );
    }

    @Transactional(readOnly = true)
    public List<ReviewActivityDto> getActivity(Long memberId, int days) {
        LocalDate from = LocalDate.now().minusDays(days - 1L);
        return reviewActivityRepository
                .findByMemberIdAndActivityDateGreaterThanEqualOrderByActivityDateAsc(memberId, from).stream()
                .map(a -> new ReviewActivityDto(a.getActivityDate(), a.getCount()))
                .toList();
    }

    private void recordActivity(Long memberId) {
        LocalDate today = LocalDate.now();
        ReviewActivity activity = reviewActivityRepository.findByMemberIdAndActivityDate(memberId, today)
                .orElseGet(() -> ReviewActivity.builder()
                        .member(memberRepository.getReferenceById(memberId))
                        .activityDate(today)
                        .count(0)
                        .build());
        activity.setCount(activity.getCount() + 1);
        reviewActivityRepository.save(activity);
    }

    private void applySm2(ReviewProgress progress, boolean correct) {
        if (!correct) {
            progress.setRepetitions(0);
            progress.setIntervalDays(1);
            progress.setEaseFactor(Math.max(MIN_EASE_FACTOR, progress.getEaseFactor() - 0.2));
        } else {
            int repetitions = progress.getRepetitions() + 1;
            int interval = switch (repetitions) {
                case 1 -> 1;
                case 2 -> 6;
                default -> (int) Math.round(progress.getIntervalDays() * progress.getEaseFactor());
            };
            progress.setRepetitions(repetitions);
            progress.setIntervalDays(Math.max(1, interval));
            progress.setEaseFactor(progress.getEaseFactor() + 0.1);
        }
        progress.setNextReviewAt(LocalDateTime.now().plusDays(progress.getIntervalDays()));
    }

    private boolean isDue(ReviewProgress progress, LocalDateTime now) {
        return progress == null || !progress.getNextReviewAt().isAfter(now);
    }

    private QuizQuestionDto buildQuizQuestion(BookWord bookWord) {
        Word word = bookWord.getWord();
        String correctAnswer = meaningOf(word);

        List<Word> distractorWords = wordRepository.findRandomExcluding(word.getId(), CHOICE_COUNT - 1);
        List<String> choices = new ArrayList<>();
        choices.add(correctAnswer);
        distractorWords.forEach(w -> choices.add(meaningOf(w)));

        Collections.shuffle(choices);
        int correctIndex = choices.indexOf(correctAnswer);

        return new QuizQuestionDto(bookWord.getId(), word.getText(), word.getPronunciation(), choices, correctIndex);
    }

    private String meaningOf(Word word) {
        return word.getDefinitionKo() != null && !word.getDefinitionKo().isBlank()
                ? word.getDefinitionKo()
                : word.getDefinitionEn();
    }
}
