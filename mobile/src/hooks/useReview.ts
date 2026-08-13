import { useCallback, useEffect, useState } from 'react';
import * as reviewApi from '../apis/review';
import { QuizQuestionDto } from '../apis/review';

export function useReview(bookId: number) {
    const [queue, setQueue] = useState<QuizQuestionDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await reviewApi.getReviewQueue(bookId);
            setQueue(result ?? []);
        } finally {
            setIsLoading(false);
        }
    }, [bookId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const submitResult = useCallback(async (bookWordId: number, correct: boolean) => {
        await reviewApi.submitReviewResult(bookWordId, correct);
    }, []);

    return { queue, isLoading, refresh, submitResult };
}
