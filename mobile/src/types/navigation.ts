import { WordLanguage } from '../apis/words';

export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
};

export type MainStackParamList = {
    BooksList: undefined;
    BookDetail: { bookId: number; bookName: string; language: WordLanguage };
    Scan: { bookId: number; language: WordLanguage };
    WordConfirm: { bookId: number; texts: string[]; language: WordLanguage };
    Review: { bookId: number; bookName: string };
    BookShare: { bookId: number };
};

export type RootTabParamList = {
    BooksTab: undefined;
    ProfileTab: undefined;
};
