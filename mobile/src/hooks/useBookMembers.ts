import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import * as booksApi from '../apis/books';

export function useBookMembers(bookId: number) {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['books', bookId, 'members'],
        queryFn: async () => (await booksApi.getBookMembers(bookId)) ?? [],
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch]),
    );

    return { members: data ?? [], isLoading, refresh: refetch };
}
