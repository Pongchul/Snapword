import { fetcher } from './fetcher';

export interface MemberDto {
    id: number;
    email: string;
    nickname: string;
}

export interface AuthResponse {
    accessToken: string;
    member: MemberDto;
}

export type SignupRequest = {
    email: string;
    password: string;
    nickname: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export const signup = (body: SignupRequest) =>
    fetcher.post<SignupRequest, AuthResponse>({ path: '/api/v1/auth/signup', body });

export const login = (body: LoginRequest) =>
    fetcher.post<LoginRequest, AuthResponse>({ path: '/api/v1/auth/login', body });

export const getMe = () => fetcher.get<MemberDto>({ path: '/api/v1/auth/me' });
