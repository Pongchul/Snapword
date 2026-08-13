import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import { useBookWords } from '../hooks/useBookWords';
import * as booksApi from '../apis/books';
import { BookWordDto } from '../apis/books';
import ApiError from '../apis/apiError';
import { colors, radius, shadow, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'BookDetail'>;

export default function BookDetailScreen({ route, navigation }: Props) {
    const { bookId, bookName, language } = route.params;
    const { bookWords, isLoading, refresh } = useBookWords(bookId);

    const handleRemove = (bookWordId: number) => {
        Alert.alert('단어 삭제', '이 단어를 단어장에서 삭제할까요?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await booksApi.removeBookWord(bookId, bookWordId);
                        refresh();
                    } catch (error) {
                        Alert.alert('삭제 실패', error instanceof ApiError ? error.message : '다시 시도해주세요.');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: BookWordDto }) => (
        <TouchableOpacity style={styles.wordCard} onLongPress={() => handleRemove(item.id)} activeOpacity={0.7}>
            <View style={styles.wordHeader}>
                <Text style={styles.wordText}>{item.word.text}</Text>
                {item.word.partOfSpeech ? (
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{item.word.partOfSpeech}</Text>
                    </View>
                ) : null}
            </View>
            {item.word.pronunciation ? <Text style={styles.pronunciation}>[{item.word.pronunciation}]</Text> : null}
            <Text style={styles.meaning}>{item.word.definitionKo ?? item.word.definitionEn}</Text>
            {item.word.example ? <Text style={styles.example}>"{item.word.example}"</Text> : null}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('Scan', { bookId, language })}
                >
                    <Text style={styles.actionIcon}>📷</Text>
                    <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>촬영 추가</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('Review', { bookId, bookName })}
                >
                    <Text style={styles.actionIcon}>🧠</Text>
                    <Text style={styles.actionButtonText}>복습하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('BookShare', { bookId })}
                >
                    <Text style={styles.actionIcon}>🔗</Text>
                    <Text style={styles.actionButtonText}>공유</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={bookWords}
                keyExtractor={item => String(item.id)}
                renderItem={renderItem}
                refreshing={isLoading}
                onRefresh={refresh}
                ListHeaderComponent={
                    bookWords.length > 0 ? <Text style={styles.countLabel}>{bookWords.length}개 단어</Text> : null
                }
                ListEmptyComponent={
                    !isLoading ? <Text style={styles.empty}>아직 저장된 단어가 없어요. 사진을 찍어보세요!</Text> : null
                }
                contentContainerStyle={bookWords.length === 0 ? styles.emptyContainer : styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    actionRow: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm },
    actionButton: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        alignItems: 'center',
        gap: 4,
    },
    actionButtonPrimary: { backgroundColor: colors.primaryLight },
    actionIcon: { fontSize: 20 },
    actionButtonText: { fontSize: 12, fontWeight: '700', color: colors.textSub },
    actionButtonTextPrimary: { color: colors.primary },
    list: { padding: spacing.lg, paddingTop: 4 },
    countLabel: { ...typography.caption, marginBottom: spacing.md },
    wordCard: {
        backgroundColor: colors.background,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadow.card,
    },
    wordHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    wordText: { fontSize: 19, fontWeight: '800', color: colors.textMain },
    tag: {
        backgroundColor: colors.primaryLight,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
    },
    tagText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    pronunciation: { ...typography.caption, marginTop: 4 },
    meaning: { fontSize: 15, color: colors.textMain, marginTop: spacing.sm },
    example: { ...typography.caption, marginTop: spacing.sm, fontStyle: 'italic' },
    empty: { textAlign: 'center', color: colors.textPlaceholder, marginTop: 40 },
    emptyContainer: { flexGrow: 1 },
});
