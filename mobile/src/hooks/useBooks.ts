import { useQuery } from '@tanstack/react-query';
import * as booksApi from '../apis/books';

export function useBooks() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['books'],
        queryFn: async () => (await booksApi.getMyBooks()) ?? [],
    });

    return { books: data ?? [], isLoading, refresh: refetch };
}
