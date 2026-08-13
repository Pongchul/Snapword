package com.snapword.backend.member.service;

import com.snapword.backend.member.domain.Member;
import com.snapword.backend.member.dto.MemberDto;
import com.snapword.backend.member.dto.SignupRequest;
import com.snapword.backend.member.exception.DuplicateEmailException;
import com.snapword.backend.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MemberService {

    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MIN_CHARACTER_CLASSES = 2;
    private static final Pattern HAS_LETTER = Pattern.compile("[A-Za-z]");
    private static final Pattern HAS_DIGIT = Pattern.compile("[0-9]");
    private static final Pattern HAS_SPECIAL = Pattern.compile("[^A-Za-z0-9]");

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberDto signup(SignupRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        }
        if (request.nickname() == null || request.nickname().isBlank()) {
            throw new IllegalArgumentException("닉네임을 입력해주세요.");
        }
        validatePassword(request.password());
        if (memberRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException(request.email());
        }

        Member member = Member.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .nickname(request.nickname())
                .build();

        Member saved = memberRepository.save(member);
        return new MemberDto(saved.getId(), saved.getEmail(), saved.getNickname());
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalArgumentException("비밀번호는 " + MIN_PASSWORD_LENGTH + "자 이상이어야 합니다.");
        }
        int classes = 0;
        if (HAS_LETTER.matcher(password).find()) classes++;
        if (HAS_DIGIT.matcher(password).find()) classes++;
        if (HAS_SPECIAL.matcher(password).find()) classes++;
        if (classes < MIN_CHARACTER_CLASSES) {
            throw new IllegalArgumentException("비밀번호는 영문/숫자/특수문자 중 " + MIN_CHARACTER_CLASSES + "종류 이상을 포함해야 합니다.");
        }
    }
}
