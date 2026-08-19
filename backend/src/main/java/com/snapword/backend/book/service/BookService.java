package com.snapword.backend.book.service;

import com.snapword.backend.book.domain.Book;
import com.snapword.backend.book.domain.BookMember;
import com.snapword.backend.book.domain.BookRole;
import com.snapword.backend.book.domain.BookVisibility;
import com.snapword.backend.book.domain.BookWord;
import com.snapword.backend.book.dto.BookDto;
import com.snapword.backend.book.dto.BookMemberDto;
import com.snapword.backend.book.dto.CreateBookRequest;
import com.snapword.backend.book.exception.BookNotFoundException;
import com.snapword.backend.book.exception.ForbiddenBookAccessException;
import com.snapword.backend.book.exception.InvalidInviteCodeException;
import com.snapword.backend.book.repository.BookMemberRepository;
import com.snapword.backend.book.repository.BookRepository;
import com.snapword.backend.book.repository.BookWordDefinitionRepository;
import com.snapword.backend.book.repository.BookWordRepository;
import com.snapword.backend.member.domain.Member;
import com.snapword.backend.member.repository.MemberRepository;
import com.snapword.backend.review.repository.ReviewProgressRepository;
import com.snapword.backend.word.domain.WordLanguage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    // 혼동되는 문자(0/O, 1/I) 제외
    private static final String INVITE_CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final int INVITE_CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final BookRepository bookRepository;
    private final BookMemberRepository bookMemberRepository;
    private final BookWordRepository bookWordRepository;
    private final BookWordDefinitionRepository bookWordDefinitionRepository;
    private final ReviewProgressRepository reviewProgressRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public BookDto createBook(Long memberId, CreateBookRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("단어장 이름을 입력해주세요.");
        }
        Member owner = getMember(memberId);

        Book book = Book.builder()
                .owner(owner)
                .name(request.name())
                .description(request.description())
                .visibility(BookVisibility.PRIVATE)
                .language(request.language() != null ? request.language() : WordLanguage.EN)
                .build();
        Book saved = bookRepository.save(book);

        bookMemberRepository.save(BookMember.builder()
                .book(saved)
                .member(owner)
                .role(BookRole.OWNER)
                .build());

        return toDto(saved, BookRole.OWNER);
    }

    @Transactional(readOnly = true)
    public List<BookDto> getMyBooks(Long memberId) {
        return bookMemberRepository.findByMemberIdOrderByJoinedAtDesc(memberId).stream()
                .map(bm -> toDto(bm.getBook(), bm.getRole()))
                .toList();
    }

    @Transactional(readOnly = true)
    public BookDto getBook(Long bookId, Long memberId) {
        BookMember membership = requireMembership(bookId, memberId);
        return toDto(membership.getBook(), membership.getRole());
    }

    @Transactional
    public void deleteBook(Long bookId, Long memberId) {
        BookMember membership = requireMembership(bookId, memberId);
        if (membership.getRole() != BookRole.OWNER) {
            throw new ForbiddenBookAccessException("단어장 삭제는 소유자만 가능합니다.");
        }

        List<BookWord> bookWords = bookWordRepository.findByBookIdOrderByCreatedAtDesc(bookId);
        for (BookWord bookWord : bookWords) {
            reviewProgressRepository.deleteByBookWordId(bookWord.getId());
            bookWordDefinitionRepository.deleteByBookWordId(bookWord.getId());
        }
        bookWordRepository.deleteAll(bookWords);
        bookMemberRepository.deleteByBookId(bookId);
        bookRepository.delete(membership.getBook());
    }

    @Transactional
    public String generateInviteCode(Long bookId, Long memberId) {
        BookMember membership = requireMembership(bookId, memberId);
        if (membership.getRole() != BookRole.OWNER) {
            throw new ForbiddenBookAccessException("초대코드 발급은 소유자만 가능합니다.");
        }
        Book book = membership.getBook();
        book.setInviteCode(generateUniqueCode());
        book.setVisibility(BookVisibility.SHARED);
        return book.getInviteCode();
    }

    @Transactional
    public BookDto joinByInviteCode(Long memberId, String inviteCode) {
        Book book = bookRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new InvalidInviteCodeException(inviteCode));

        if (bookMemberRepository.existsByBookIdAndMemberId(book.getId(), memberId)) {
            BookMember existing = bookMemberRepository.findByBookIdAndMemberId(book.getId(), memberId).orElseThrow();
            return toDto(book, existing.getRole());
        }

        Member member = getMember(memberId);
        BookMember joined = bookMemberRepository.save(BookMember.builder()
                .book(book)
                .member(member)
                .role(BookRole.VIEWER)
                .build());

        return toDto(book, joined.getRole());
    }

    @Transactional(readOnly = true)
    public List<BookMemberDto> getMembers(Long bookId, Long memberId) {
        requireMembership(bookId, memberId);
        return bookMemberRepository.findByBookIdOrderByJoinedAtAsc(bookId).stream()
                .map(bm -> new BookMemberDto(bm.getMember().getId(), bm.getMember().getNickname(),
                        bm.getMember().getEmail(), bm.getRole()))
                .toList();
    }

    @Transactional
    public void updateMemberRole(Long bookId, Long requesterId, Long targetMemberId, BookRole newRole) {
        BookMember requesterMembership = requireMembership(bookId, requesterId);
        if (requesterMembership.getRole() != BookRole.OWNER) {
            throw new ForbiddenBookAccessException("멤버 권한 변경은 소유자만 가능합니다.");
        }
        if (newRole == BookRole.OWNER) {
            throw new IllegalArgumentException("소유자 권한은 위임할 수 없습니다.");
        }

        BookMember target = bookMemberRepository.findByBookIdAndMemberId(bookId, targetMemberId)
                .orElseThrow(() -> new IllegalArgumentException("해당 단어장 멤버가 아닙니다."));
        if (target.getRole() == BookRole.OWNER) {
            throw new ForbiddenBookAccessException("소유자의 권한은 변경할 수 없습니다.");
        }

        target.setRole(newRole);
    }

    /** 다른 도메인(BookWordService, ReviewService)에서도 재사용하는 멤버십 검증 */
    @Transactional(readOnly = true)
    public BookMember requireMembership(Long bookId, Long memberId) {
        bookRepository.findById(bookId).orElseThrow(() -> new BookNotFoundException(bookId));
        return bookMemberRepository.findByBookIdAndMemberId(bookId, memberId)
                .orElseThrow(() -> new ForbiddenBookAccessException("해당 단어장에 접근할 권한이 없습니다."));
    }

    private Member getMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(INVITE_CODE_LENGTH);
            for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
                sb.append(INVITE_CODE_CHARS.charAt(RANDOM.nextInt(INVITE_CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (bookRepository.findByInviteCode(code).isPresent());
        return code;
    }

    private BookDto toDto(Book book, BookRole myRole) {
        return new BookDto(
                book.getId(),
                book.getName(),
                book.getDescription(),
                book.getVisibility(),
                book.getLanguage(),
                myRole,
                bookMemberRepository.countByBookId(book.getId()),
                book.getCreatedAt()
        );
    }
}
