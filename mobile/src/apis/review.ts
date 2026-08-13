import { fetcher } from './fetcher';

export interface QuizQuestionDto {
    bookWordId: number;
    wordText: string;
    pronunciation: string | null;
    choices: string[];
    correctIndex: number;
}

export interface ReviewProgressDto {
    bookWordId: number;
    repetitions: number;
    intervalDays: number;
    easeFactor: number;
    nextReviewAt: string;
}

export const getReviewQueue = (bookId: number) =>
    fetcher.get<QuizQuestionDto[]>({ path: `/api/v1/books/${bookId}/review/queue` });

export const submitReviewResult = (bookWordId: number, correct: boolean) =>
    fetcher.post<{ correct: boolean }, ReviewProgressDto>({
        path: `/api/v1/review/${bookWordId}/result`,
        body: { correct },
    });
