import { fetcher } from './fetcher';

export type WordLanguage = 'EN' | 'JA';

export interface WordDto {
    id: number;
    text: string;
    language: WordLanguage;
    partOfSpeech: string | null;
    definitionEn: string | null;
    definitionKo: string | null;
    pronunciation: string | null;
    example: string | null;
}

export const lookupWord = (text: string, language: WordLanguage) =>
    fetcher.get<WordDto>({ path: '/api/v1/words/lookup', query: { text, language } });
