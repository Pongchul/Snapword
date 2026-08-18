import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import * as booksApi from '../apis/books';

export function useBookWords(bookId: number) {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['books', bookId, 'words'],
        queryFn: async () => (await booksApi.getBookWords(bookId)) ?? [],
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch]),
    );

    return { bookWords: data ?? [], isLoading, refresh: refetch };
}
