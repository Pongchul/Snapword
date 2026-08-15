package com.snapword.backend.book.service;

import com.snapword.backend.book.domain.Book;
import com.snapword.backend.book.domain.BookMember;
import com.snapword.backend.book.domain.BookRole;
import com.snapword.backend.book.domain.BookVisibility;
import com.snapword.backend.book.dto.BookDto;
import com.snapword.backend.book.dto.CreateBookRequest;
import com.snapword.backend.book.exception.BookNotFoundException;
import com.snapword.backend.book.exception.ForbiddenBookAccessException;
import com.snapword.backend.book.exception.InvalidInviteCodeException;
import com.snapword.backend.book.repository.BookMemberRepository;
import com.snapword.backend.book.repository.BookRepository;
import com.snapword.backend.member.domain.Member;
import com.snapword.backend.member.repository.MemberRepository;
import com.snapword.backend.word.domain.WordLanguage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private BookMemberRepository bookMemberRepository;

    @Mock
    private MemberRepository memberRepository;

    private BookService bookService;

    private Member owner;

    @BeforeEach
    void setUp() {
        bookService = new BookService(bookRepository, bookMemberRepository, memberRepository);
        owner = Member.builder().id(1L).email("owner@example.com").nickname("주인장").build();
    }

    @Test
    void createBook_소유자와_함께_단어장을_생성한다() {
        CreateBookRequest request = new CreateBookRequest("영단어장", "설명", null);
        when(memberRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> {
            Book book = invocation.getArgument(0);
            book.setId(10L);
            return book;
        });
        when(bookMemberRepository.countByBookId(10L)).thenReturn(1L);

        BookDto result = bookService.createBook(1L, request);

        assertThat(result.id()).isEqualTo(10L);
        assertThat(result.name()).isEqualTo("영단어장");
        assertThat(result.visibility()).isEqualTo(BookVisibility.PRIVATE);
        assertThat(result.language()).isEqualTo(WordLanguage.EN);
        assertThat(result.myRole()).isEqualTo(BookRole.OWNER);

        ArgumentCaptor<BookMember> memberCaptor = ArgumentCaptor.forClass(BookMember.class);
        verify(bookMemberRepository).save(memberCaptor.capture());
        assertThat(memberCaptor.getValue().getRole()).isEqualTo(BookRole.OWNER);
        assertThat(memberCaptor.getValue().getMember()).isEqualTo(owner);
    }

    @Test
    void createBook_언어를_지정하면_해당_언어로_생성한다() {
        CreateBookRequest request = new CreateBookRequest("일본어장", null, WordLanguage.JA);
        when(memberRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> {
            Book book = invocation.getArgument(0);
            book.setId(11L);
            return book;
        });
        when(bookMemberRepository.countByBookId(11L)).thenReturn(1L);

        BookDto result = bookService.createBook(1L, request);

        assertThat(result.language()).isEqualTo(WordLanguage.JA);
    }

    @Test
    void createBook_이름이_비어있으면_예외를_던진다() {
        CreateBookRequest request = new CreateBookRequest(" ", null, null);

        assertThatThrownBy(() -> bookService.createBook(1L, request))
                .isInstanceOf(IllegalArgumentException.class);
        verify(bookRepository, never()).save(any());
    }

    @Test
    void createBook_존재하지_않는_회원이면_예외를_던진다() {
        CreateBookRequest request = new CreateBookRequest("영단어장", null, null);
        when(memberRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.createBook(1L, request))
                .isInstanceOf(IllegalArgumentException.class);
        verify(bookRepository, never()).save(any());
    }

    @Test
    void getMyBooks_참여중인_단어장_목록을_반환한다() {
        Book book = Book.builder().id(10L).owner(owner).name("영단어장").visibility(BookVisibility.PRIVATE).language(WordLanguage.EN).build();
        BookMember membership = BookMember.builder().book(book).member(owner).role(BookRole.OWNER).build();
        when(bookMemberRepository.findByMemberIdOrderByJoinedAtDesc(1L)).thenReturn(List.of(membership));
        when(bookMemberRepository.countByBookId(10L)).thenReturn(1L);

        List<BookDto> result = bookService.getMyBooks(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(10L);
        assertThat(result.get(0).myRole()).isEqualTo(BookRole.OWNER);
    }

    @Test
    void getBook_멤버십이_있으면_단어장_정보를_반환한다() {
        Book book = Book.builder().id(10L).owner(owner).name("영단어장").visibility(BookVisibility.PRIVATE).language(WordLanguage.EN).build();
        BookMember membership = BookMember.builder().book(book).member(owner).role(BookRole.VIEWER).build();
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(bookMemberRepository.findByBookIdAndMemberId(10L, 1L)).thenReturn(Optional.of(membership));
        when(bookMemberRepository.countByBookId(10L)).thenReturn(2L);

        BookDto result = bookService.getBook(10L, 1L);

        assertThat(result.myRole()).isEqualTo(BookRole.VIEWER);
        assertThat(result.memberCount()).isEqualTo(2L);
    }

    @Test
    void getBook_존재하지_않는_단어장이면_예외를_던진다() {
        when(bookRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.getBook(10L, 1L))
                .isInstanceOf(BookNotFoundException.class);
    }

    @Test
    void getBook_멤버십이_없으면_예외를_던진다() {
        Book book = Book.builder().id(10L).owner(owner).build();
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(bookMemberRepository.findByBookIdAndMemberId(10L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.getBook(10L, 1L))
                .isInstanceOf(ForbiddenBookAccessException.class);
    }

    @Test
    void deleteBook_소유자면_단어장을_삭제한다() {
        Book book = Book.builder().id(10L).owner(owner).build();
        BookMember membership = BookMember.builder().book(book).member(owner).role(BookRole.OWNER).build();
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(bookMemberRepository.findByBookIdAndMemberId(10L, 1L)).thenReturn(Optional.of(membership));

        bookService.deleteBook(10L, 1L);

        verify(bookRepository).delete(book);
    }

    @Test
    void deleteBook_소유자가_아니면_예외를_던진다() {
        Book book = Book.builder().id(10L).owner(owner).build();
        BookMember membership = BookMember.builder().book(book).member(owner).role(BookRole.EDITOR).build();
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(bookMemberRepository.findByBookIdAndMemberId(10L, 1L)).thenReturn(Optional.of(membership));

        assertThatThrownBy(() -> bookService.deleteBook(10L, 1L))
                .isInstanceOf(ForbiddenBookAccessException.class);
        verify(bookRepository, never()).delete(any());
    }

    @Test
    void generateInviteCode_소유자면_초대코드를_발급하고_공유_상태로_전환한다() {
        Book book = Book.builder().id(10L).owner(owner).visibility(BookVisibility.PRIVATE).build();
        BookMember membership = BookMember.builder().book(book).member(owner).role(BookRole.OWNER).build();
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(bookMemberRepository.findByBookIdAndMemberId(10L, 1L)).thenReturn(Optional.of(membership));
        when(bookRepository.findByInviteCode(anyString())).thenReturn(Optional.empty());

        String inviteCode = bookService.generateInviteCode(10L, 1L);

        assertThat(inviteCode).hasSize(8);
        assertThat(book.getVisibility()).isEqualTo(BookVisibility.SHARED);
        assertThat(book.getInviteCode()).isEqualTo(inviteCode);
    }

    @Test
    void generateInviteCode_중복된_코드가_생성되면_재시도한다() {
        Book book = Book.builder().id(10L).owner(owner).visibility(BookVisibility.PRIVATE).build();
        Book otherBook = Book.builder().id(99L).build();
        BookMember membership = BookMember.builder().book(book).member(owner).role(BookRole.OWNER).build();
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(bookMemberRepository.findByBookIdAndMemberId(10L, 1L)).thenReturn(Optional.of(membership));
        when(bookRepository.findByInviteCode(anyString()))
                .thenReturn(Optional.of(otherBook))
                .thenReturn(Optional.empty());

        bookService.generateInviteCode(10L, 1L);

        verify(bookRepository, times(2)).findByInviteCode(anyString());
    }

    @Test
    void generateInviteCode_소유자가_아니면_예외를_던진다() {
        Book book = Book.builder().id(10L).owner(owner).build();
        BookMember membership = BookMember.builder().book(book).member(owner).role(BookRole.VIEWER).build();
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(bookMemberRepository.findByBookIdAndMemberId(10L, 1L)).thenReturn(Optional.of(membership));

        assertThatThrownBy(() -> bookService.generateInviteCode(10L, 1L))
                .isInstanceOf(ForbiddenBookAccessException.class);
    }

    @Test
    void joinByInviteCode_유효하지_않은_코드면_예외를_던진다() {
        when(bookRepository.findByInviteCode("BADCODE1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.joinByInviteCode(1L, "BADCODE1"))
                .isInstanceOf(InvalidInviteCodeException.class);
    }

    @Test
    void joinByInviteCode_이미_참여중이면_기존_역할을_반환한다() {
        Book book = Book.builder().id(10L).owner(owner).inviteCode("CODE1234").build();
        BookMember existing = BookMember.builder().book(book).member(owner).role(BookRole.EDITOR).build();
        when(bookRepository.findByInviteCode("CODE1234")).thenReturn(Optional.of(book));
        when(bookMemberRepository.existsByBookIdAndMemberId(10L, 1L)).thenReturn(true);
        when(bookMemberRepository.findByBookIdAndMemberId(10L, 1L)).thenReturn(Optional.of(existing));
        when(bookMemberRepository.countByBookId(10L)).thenReturn(2L);

        BookDto result = bookService.joinByInviteCode(1L, "CODE1234");

        assertThat(result.myRole()).isEqualTo(BookRole.EDITOR);
        verify(bookMemberRepository, never()).save(any());
    }

    @Test
    void joinByInviteCode_참여중이_아니면_뷰어로_새로_등록한다() {
        Book book = Book.builder().id(10L).owner(owner).inviteCode("CODE1234").build();
        Member joiner = Member.builder().id(2L).email("joiner@example.com").nickname("참여자").build();
        when(bookRepository.findByInviteCode("CODE1234")).thenReturn(Optional.of(book));
        when(bookMemberRepository.existsByBookIdAndMemberId(10L, 2L)).thenReturn(false);
        when(memberRepository.findById(2L)).thenReturn(Optional.of(joiner));
        when(bookMemberRepository.save(any(BookMember.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookMemberRepository.countByBookId(10L)).thenReturn(2L);

        BookDto result = bookService.joinByInviteCode(2L, "CODE1234");

        assertThat(result.myRole()).isEqualTo(BookRole.VIEWER);
        ArgumentCaptor<BookMember> captor = ArgumentCaptor.forClass(BookMember.class);
        verify(bookMemberRepository).save(captor.capture());
        assertThat(captor.getValue().getMember()).isEqualTo(joiner);
        assertThat(captor.getValue().getRole()).isEqualTo(BookRole.VIEWER);
    }

    @Test
    void requireMembership_단어장이_없으면_예외를_던진다() {
        when(bookRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.requireMembership(10L, 1L))
                .isInstanceOf(BookNotFoundException.class);
    }

    @Test
    void requireMembership_멤버십이_없으면_예외를_던진다() {
        Book book = Book.builder().id(10L).owner(owner).build();
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(bookMemberRepository.findByBookIdAndMemberId(10L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.requireMembership(10L, 1L))
                .isInstanceOf(ForbiddenBookAccessException.class);
    }
}
