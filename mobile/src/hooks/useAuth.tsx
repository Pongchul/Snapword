import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../apis/auth';
import { MemberDto } from '../apis/auth';
import { tokenStorage } from '../utils/secureStorage';

type AuthContextValue = {
    member: MemberDto | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, nickname: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [member, setMember] = useState<MemberDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const token = await tokenStorage.load();
            if (token) {
                try {
                    const me = await authApi.getMe();
                    setMember(me);
                } catch {
                    await tokenStorage.clear();
                }
            }
            setIsLoading(false);
        })();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const result = await authApi.login({ email, password });
        if (!result) throw new Error('로그인에 실패했습니다.');
        await tokenStorage.save(result.accessToken);
        setMember(result.member);
    }, []);

    const signup = useCallback(async (email: string, password: string, nickname: string) => {
        const result = await authApi.signup({ email, password, nickname });
        if (!result) throw new Error('회원가입에 실패했습니다.');
        await tokenStorage.save(result.accessToken);
        setMember(result.member);
    }, []);

    const logout = useCallback(async () => {
        await tokenStorage.clear();
        setMember(null);
    }, []);

    return (
        <AuthContext.Provider value={{ member, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
    }
    return context;
}
