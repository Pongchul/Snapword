import { fetcher } from './fetcher';
import { WordDto, WordLanguage } from './words';

export type BookRole = 'OWNER' | 'EDITOR' | 'VIEWER';
export type BookVisibility = 'PRIVATE' | 'SHARED';

export interface BookDto {
    id: number;
    name: string;
    description: string | null;
    visibility: BookVisibility;
    language: WordLanguage;
    myRole: BookRole;
    memberCount: number;
    createdAt: string;
}

export interface BookWordDto {
    id: number;
    word: WordDto;
    note: string | null;
    addedByNickname: string;
    createdAt: string;
}

export const createBook = (body: { name: string; description?: string; language?: WordLanguage }) =>
    fetcher.post<typeof body, BookDto>({ path: '/api/v1/books', body });

export const getMyBooks = () => fetcher.get<BookDto[]>({ path: '/api/v1/books' });

export const getBook = (bookId: number) => fetcher.get<BookDto>({ path: `/api/v1/books/${bookId}` });

export const deleteBook = (bookId: number) => fetcher.delete<void>({ path: `/api/v1/books/${bookId}` });

export const generateInviteCode = (bookId: number) =>
    fetcher.post<Record<string, never>, { inviteCode: string }>({
        path: `/api/v1/books/${bookId}/invite-code`,
        body: {},
    });

export const joinBookByCode = (inviteCode: string) =>
    fetcher.post<{ inviteCode: string }, BookDto>({ path: '/api/v1/books/join', body: { inviteCode } });

export const getBookWords = (bookId: number) =>
    fetcher.get<BookWordDto[]>({ path: `/api/v1/books/${bookId}/words` });

export const addBookWord = (bookId: number, body: { wordId: number; note?: string }) =>
    fetcher.post<typeof body, BookWordDto>({ path: `/api/v1/books/${bookId}/words`, body });

export const removeBookWord = (bookId: number, bookWordId: number) =>
    fetcher.delete<void>({ path: `/api/v1/books/${bookId}/words/${bookWordId}` });
