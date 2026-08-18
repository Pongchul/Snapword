import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as reviewApi from '../apis/review';

export function useReview(bookId: number) {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['books', bookId, 'review-queue'],
        queryFn: async () => (await reviewApi.getReviewQueue(bookId)) ?? [],
    });

    const submitResult = useCallback(async (bookWordId: number, correct: boolean) => {
        await reviewApi.submitReviewResult(bookWordId, correct);
    }, []);

    return { queue: data ?? [], isLoading, refresh: refetch, submitResult };
}
