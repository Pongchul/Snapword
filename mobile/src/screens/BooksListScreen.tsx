import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alert } from '../components/AppAlert';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import { useBooks } from '../hooks/useBooks';
import { useAuth } from '../hooks/useAuth';
import * as booksApi from '../apis/books';
import { BookDto } from '../apis/books';
import { WordLanguage } from '../apis/words';
import ApiError from '../apis/apiError';
import Button from '../components/Button';
import TextField from '../components/TextField';
import Icon from '../components/Icon';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { colors, radius, shadow, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'BooksList'>;

const BOOK_TINTS = [
    { background: colors.primaryLight, iconColor: colors.primary },
    { background: colors.successLight, iconColor: colors.success },
    { background: colors.dangerLight, iconColor: colors.danger },
];
const LANGUAGE_OPTIONS: { value: WordLanguage; label: string }[] = [
    { value: 'EN', label: '영어' },
    { value: 'JA', label: '일본어' },
];

export default function BooksListScreen({ navigation }: Props) {
    const { member } = useAuth();
    const { books, isLoading, refresh } = useBooks();
    const [newBookName, setNewBookName] = useState('');
    const [newBookLanguage, setNewBookLanguage] = useState<WordLanguage>('EN');
    const [inviteCode, setInviteCode] = useState('');
    const [showJoinInput, setShowJoinInput] = useState(false);
    const [showCreateCard, setShowCreateCard] = useState(false);

    const handleCreate = async () => {
        if (!newBookName.trim()) return;
        try {
            await booksApi.createBook({ name: newBookName.trim(), language: newBookLanguage });
            setNewBookName('');
            setNewBookLanguage('EN');
            setShowCreateCard(false);
            refresh();
        } catch (error) {
            Alert.alert('생성 실패', error instanceof ApiError ? error.message : '단어장을 만들지 못했습니다.');
        }
    };

    const handleJoin = async () => {
        if (!inviteCode.trim()) return;
        try {
            await booksApi.joinBookByCode(inviteCode.trim().toUpperCase());
            setInviteCode('');
            setShowJoinInput(false);
            refresh();
        } catch (error) {
            Alert.alert('참여 실패', error instanceof ApiError ? error.message : '초대코드를 확인해주세요.');
        }
    };

    const handleDelete = (book: BookDto) => {
        Alert.alert('단어장 삭제', `"${book.name}" 단어장을 삭제할까요? 저장된 단어가 모두 사라집니다.`, [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await booksApi.deleteBook(book.id);
                        refresh();
                    } catch (error) {
                        Alert.alert('삭제 실패', error instanceof ApiError ? error.message : '다시 시도해주세요.');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item, index }: { item: BookDto; index: number }) => {
        const tint = BOOK_TINTS[index % BOOK_TINTS.length];
        return (
        <TouchableOpacity
            style={styles.bookCard}
            activeOpacity={0.7}
            onPress={() =>
                navigation.navigate('BookDetail', { bookId: item.id, bookName: item.name, language: item.language })
            }
            onLongPress={item.myRole === 'OWNER' ? () => handleDelete(item) : undefined}
        >
            <View style={[styles.bookIcon, { backgroundColor: tint.background }]}>
                <Icon name="book" size={22} color={tint.iconColor} />
            </View>
            <View style={styles.bookInfo}>
                <Text style={styles.bookName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.bookMeta}>
                    {item.myRole === 'OWNER' ? '내 단어장' : '공유받음'} · 멤버 {item.memberCount}명
                </Text>
            </View>
            {item.myRole === 'OWNER' ? (
                <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8}>
                    <Icon name="trash-2" size={17} color={colors.textPlaceholder} />
                </TouchableOpacity>
            ) : null}
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        );
    };

    return (
        <ResponsiveContainer style={styles.container}>
            <FlatList
                data={books}
                keyExtractor={item => String(item.id)}
                renderItem={renderItem}
                refreshing={isLoading}
                onRefresh={refresh}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View>
                        <View style={styles.heroCard}>
                            <View style={styles.heroBadge}>
                                <Icon name="camera" size={22} color={colors.primary} />
                            </View>
                            <Text style={styles.greeting}>안녕하세요,{'\n'}
                                {member?.nickname ?? ''}님</Text>
                            <Text style={styles.subGreeting}>오늘도 새 단어를 찍어볼까요?</Text>
                        </View>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>내 단어장</Text>
                            {books.length > 0 ? <Text style={styles.sectionCount}>{books.length}개</Text> : null}
                        </View>
                    </View>
                }
                ListFooterComponent={
                    <View>
                        {showCreateCard ? (
                            <View style={styles.createCard}>
                                <TextField
                                    placeholder="새 단어장 이름"
                                    value={newBookName}
                                    onChangeText={setNewBookName}
                                    autoFocus
                                />
                                <View style={styles.languageRow}>
                                    {LANGUAGE_OPTIONS.map(option => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.languageChip,
                                                newBookLanguage === option.value && styles.languageChipSelected,
                                            ]}
                                            onPress={() => setNewBookLanguage(option.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.languageChipText,
                                                    newBookLanguage === option.value && styles.languageChipTextSelected,
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.createCardRow}>
                                    <Button
                                        label="취소"
                                        variant="ghost"
                                        onPress={() => {
                                            setShowCreateCard(false);
                                            setNewBookName('');
                                        }}
                                        style={styles.createCancelButton}
                                    />
                                    <Button label="만들기" onPress={handleCreate} style={styles.createConfirmButton} />
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.addCard} activeOpacity={0.7} onPress={() => setShowCreateCard(true)}>
                                <View style={styles.addCardIconWrap}>
                                    <Text style={styles.addCardIcon}>＋</Text>
                                </View>
                                <Text style={styles.addCardText}>새 단어장 만들기</Text>
                            </TouchableOpacity>
                        )}

                        {showJoinInput ? (
                            <View style={styles.joinRow}>
                                <TextField
                                    placeholder="초대코드 입력"
                                    autoCapitalize="characters"
                                    value={inviteCode}
                                    onChangeText={setInviteCode}
                                    style={styles.joinInput}
                                />
                                <Button label="참여" variant="secondary" onPress={handleJoin} style={styles.joinButton} />
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setShowJoinInput(true)} hitSlop={8}>
                                <Text style={styles.link}>초대코드로 참여하기</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <Text style={styles.empty}>아직 단어장이 없어요. 아래에서 하나 만들어보세요!</Text>
                    ) : null
                }
            />
        </ResponsiveContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { padding: spacing.lg, paddingBottom: spacing.xxxl },
    heroCard: {
        backgroundColor: colors.primaryLight,
        borderRadius: radius.xxl,
        padding: spacing.xl,
        marginBottom: spacing.xxl,
    },
    heroBadge: {
        width: 44,
        height: 44,
        borderRadius: radius.lg,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    greeting: { ...typography.title },
    subGreeting: { ...typography.body, color: colors.textSub, marginTop: spacing.sm },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionTitle: { ...typography.heading },
    sectionCount: { ...typography.caption },
    createCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    languageRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    languageChip: {
        backgroundColor: colors.background,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    languageChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    languageChipText: { fontSize: 13, fontWeight: '700', color: colors.textSub },
    languageChipTextSelected: { color: colors.white },
    createCardRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
    createCancelButton: { flex: 1 },
    createConfirmButton: { flex: 2 },
    addCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radius.xl,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderStyle: 'dashed',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    addCardIconWrap: {
        width: 32,
        height: 32,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCardIcon: { fontSize: 16, color: colors.textSub, fontWeight: '700' },
    addCardText: { ...typography.subheading, color: colors.textSub },
    joinRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    joinInput: { flex: 1 },
    joinButton: { marginTop: 0 },
    link: { color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: spacing.xs, fontSize: 14 },
    bookCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadow.card,
    },
    bookIcon: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    bookInfo: { flex: 1 },
    bookName: { ...typography.subheading },
    bookMeta: { ...typography.caption, marginTop: 2 },
    chevron: { fontSize: 24, color: colors.textDisabled },
    empty: { textAlign: 'center', color: colors.textPlaceholder, marginTop: 40, marginBottom: spacing.xxl },
});
