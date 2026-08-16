import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as booksApi from '../apis/books';
import { BookWordDto } from '../apis/books';

export function useBookWords(bookId: number) {
    const [bookWords, setBookWords] = useState<BookWordDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await booksApi.getBookWords(bookId);
            setBookWords(result ?? []);
        } finally {
            setIsLoading(false);
        }
    }, [bookId]);

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh]),
    );

    return { bookWords, isLoading, refresh };
}
