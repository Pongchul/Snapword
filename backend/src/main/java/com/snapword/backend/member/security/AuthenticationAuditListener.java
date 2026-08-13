package com.snapword.backend.member.security;

import com.snapword.backend.config.SecurityAuditLog;
import com.snapword.backend.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.event.AbstractAuthenticationFailureEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AuthenticationAuditListener {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final MemberRepository memberRepository;

    @EventListener
    @Transactional
    public void onFailure(AbstractAuthenticationFailureEvent event) {
        String email = event.getAuthentication().getName();
        SecurityAuditLog.LOG.warn("로그인 실패: email={}, reason={}", email, event.getException().getClass().getSimpleName());

        if (event.getException() instanceof LockedException) {
            return;
        }

        memberRepository.findByEmail(email).ifPresent(member -> {
            int attempts = member.getFailedLoginAttempts() + 1;
            member.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                member.setLockedUntil(LocalDateTime.now().plus(LOCK_DURATION));
                SecurityAuditLog.LOG.warn("계정 잠금: email={}, lockedUntil={}", email, member.getLockedUntil());
            }
        });
    }

    @EventListener
    @Transactional
    public void onSuccess(AuthenticationSuccessEvent event) {
        if (!(event.getAuthentication().getPrincipal() instanceof MemberPrincipal principal)) {
            return;
        }
        SecurityAuditLog.LOG.info("로그인 성공: email={}", principal.getEmail());

        memberRepository.findById(principal.getMemberId()).ifPresent(member -> {
            member.setFailedLoginAttempts(0);
            member.setLockedUntil(null);
        });
    }
}
