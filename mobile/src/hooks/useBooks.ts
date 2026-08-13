import { useCallback, useEffect, useState } from 'react';
import * as booksApi from '../apis/books';
import { BookDto } from '../apis/books';

export function useBooks() {
    const [books, setBooks] = useState<BookDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await booksApi.getMyBooks();
            setBooks(result ?? []);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { books, isLoading, refresh };
}
