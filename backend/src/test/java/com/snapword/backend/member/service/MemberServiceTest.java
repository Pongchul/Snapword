package com.snapword.backend.member.service;

import com.snapword.backend.member.domain.Member;
import com.snapword.backend.member.dto.MemberDto;
import com.snapword.backend.member.dto.SignupRequest;
import com.snapword.backend.member.exception.DuplicateEmailException;
import com.snapword.backend.member.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private MemberService memberService;

    @BeforeEach
    void setUp() {
        memberService = new MemberService(memberRepository, passwordEncoder);
    }

    @Test
    void signup_저장된_회원_정보를_반환한다() {
        SignupRequest request = new SignupRequest("user@example.com", "password1!", "닉네임");
        when(memberRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded-password");
        when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> {
            Member member = invocation.getArgument(0);
            member.setId(1L);
            return member;
        });

        MemberDto result = memberService.signup(request);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.email()).isEqualTo(request.email());
        assertThat(result.nickname()).isEqualTo(request.nickname());
    }

    @Test
    void signup_비밀번호를_암호화하여_저장한다() {
        SignupRequest request = new SignupRequest("user@example.com", "password1!", "닉네임");
        when(memberRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded-password");
        when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));

        memberService.signup(request);

        ArgumentCaptor<Member> captor = ArgumentCaptor.forClass(Member.class);
        verify(memberRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("encoded-password");
    }

    @Test
    void signup_이메일이_비어있으면_예외를_던진다() {
        SignupRequest request = new SignupRequest(" ", "password1!", "닉네임");

        assertThatThrownBy(() -> memberService.signup(request))
                .isInstanceOf(IllegalArgumentException.class);
        verify(memberRepository, never()).save(any());
    }

    @Test
    void signup_이메일이_null이면_예외를_던진다() {
        SignupRequest request = new SignupRequest(null, "password1!", "닉네임");

        assertThatThrownBy(() -> memberService.signup(request))
                .isInstanceOf(IllegalArgumentException.class);
        verify(memberRepository, never()).save(any());
    }

    @Test
    void signup_닉네임이_비어있으면_예외를_던진다() {
        SignupRequest request = new SignupRequest("user@example.com", "password1!", "  ");

        assertThatThrownBy(() -> memberService.signup(request))
                .isInstanceOf(IllegalArgumentException.class);
        verify(memberRepository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"short1!", "1234567"})
    void signup_비밀번호가_8자_미만이면_예외를_던진다(String shortPassword) {
        SignupRequest request = new SignupRequest("user@example.com", shortPassword, "닉네임");

        assertThatThrownBy(() -> memberService.signup(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("8자");
        verify(memberRepository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"onlyletters", "12345678"})
    void signup_비밀번호가_한_종류의_문자만_포함하면_예외를_던진다(String weakPassword) {
        SignupRequest request = new SignupRequest("user@example.com", weakPassword, "닉네임");

        assertThatThrownBy(() -> memberService.signup(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("종류");
        verify(memberRepository, never()).save(any());
    }

    @Test
    void signup_이미_가입된_이메일이면_예외를_던진다() {
        SignupRequest request = new SignupRequest("user@example.com", "password1!", "닉네임");
        when(memberRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> memberService.signup(request))
                .isInstanceOf(DuplicateEmailException.class);
        verify(memberRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(anyString());
    }
}
