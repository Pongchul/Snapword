import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Tts from 'react-native-tts';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import { useBookWords } from '../hooks/useBookWords';
import * as booksApi from '../apis/books';
import * as wordsApi from '../apis/words';
import { BookWordDto } from '../apis/books';
import ApiError from '../apis/apiError';
import Button from '../components/Button';
import TextField from '../components/TextField';
import Icon from '../components/Icon';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { colors, radius, shadow, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'BookDetail'>;

export default function BookDetailScreen({ route, navigation }: Props) {
    const { bookId, bookName, language } = route.params;
    const { bookWords, isLoading, refresh } = useBookWords(bookId);
    const [editingWordId, setEditingWordId] = useState<number | null>(null);
    const [editDraft, setEditDraft] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualText, setManualText] = useState('');
    const [addingDefinitionForId, setAddingDefinitionForId] = useState<number | null>(null);
    const [newDefinitionText, setNewDefinitionText] = useState('');

    const speak = (text: string) => {
        Tts.setDefaultLanguage(language === 'JA' ? 'ja-JP' : 'en-US').catch(() => {});
        Tts.speak(text);
    };

    const startEdit = (item: BookWordDto) => {
        setEditingWordId(item.word.id);
        setEditDraft(item.word.definitionKo ?? '');
    };

    const cancelEdit = () => {
        setEditingWordId(null);
        setEditDraft('');
    };

    const saveEdit = async (wordId: number) => {
        const definitionKo = editDraft.trim();
        if (!definitionKo) return;
        setSavingEdit(true);
        try {
            await wordsApi.updateWordDefinition(wordId, { definitionKo });
            setEditingWordId(null);
            refresh();
        } catch (error) {
            Alert.alert('수정 실패', error instanceof ApiError ? error.message : '다시 시도해주세요.');
        } finally {
            setSavingEdit(false);
        }
    };

    const startAddDefinition = (bookWordId: number) => {
        setAddingDefinitionForId(bookWordId);
        setNewDefinitionText('');
    };

    const cancelAddDefinition = () => {
        setAddingDefinitionForId(null);
        setNewDefinitionText('');
    };

    const submitDefinition = async (bookWordId: number) => {
        const text = newDefinitionText.trim();
        if (!text) return;
        try {
            await booksApi.addCustomDefinition(bookId, bookWordId, text);
            setAddingDefinitionForId(null);
            setNewDefinitionText('');
            refresh();
        } catch (error) {
            Alert.alert('추가 실패', error instanceof ApiError ? error.message : '다시 시도해주세요.');
        }
    };

    const handleRemoveDefinition = (bookWordId: number, definitionId: number) => {
        booksApi
            .removeCustomDefinition(bookId, bookWordId, definitionId)
            .then(refresh)
            .catch((error: unknown) => {
                Alert.alert('삭제 실패', error instanceof ApiError ? error.message : '다시 시도해주세요.');
            });
    };

    const handleManualAdd = () => {
        const texts = Array.from(
            new Set(
                manualText
                    .split(/[,\n]/)
                    .map(t => t.trim())
                    .filter(Boolean),
            ),
        );
        if (texts.length === 0) return;
        setShowManualInput(false);
        setManualText('');
        navigation.navigate('WordConfirm', { bookId, texts, language });
    };

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
                <TouchableOpacity onPress={() => speak(item.word.text)} hitSlop={8}>
                    <Icon name="volume-2" size={18} color={colors.textSub} />
                </TouchableOpacity>
                {item.word.partOfSpeech ? (
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{item.word.partOfSpeech}</Text>
                    </View>
                ) : null}
                <View style={styles.headerSpacer} />
                <TouchableOpacity onPress={() => handleRemove(item.id)} hitSlop={8}>
                    <Icon name="trash-2" size={17} color={colors.textPlaceholder} />
                </TouchableOpacity>
            </View>
            {item.word.pronunciation ? <Text style={styles.pronunciation}>[{item.word.pronunciation}]</Text> : null}
            {editingWordId === item.word.id ? (
                <View style={styles.editBox}>
                    <TextInput
                        style={styles.editInput}
                        value={editDraft}
                        onChangeText={setEditDraft}
                        placeholder="뜻을 입력하세요"
                        placeholderTextColor={colors.textPlaceholder}
                        multiline
                        autoFocus
                    />
                    <View style={styles.editButtonRow}>
                        <TouchableOpacity onPress={cancelEdit} hitSlop={8}>
                            <Text style={styles.editCancelText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => saveEdit(item.word.id)}
                            disabled={!editDraft.trim() || savingEdit}
                            hitSlop={8}
                        >
                            <Text
                                style={[
                                    styles.editSaveText,
                                    (!editDraft.trim() || savingEdit) && styles.editSaveTextDisabled,
                                ]}
                            >
                                {savingEdit ? '저장 중...' : '저장'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.meaningRow}>
                    <Text style={styles.meaning}>{item.word.definitionKo ?? item.word.definitionEn}</Text>
                    <TouchableOpacity onPress={() => startEdit(item)} hitSlop={8}>
                        <Icon name="pencil" size={14} color={colors.textPlaceholder} />
                    </TouchableOpacity>
                </View>
            )}
            {item.word.example ? <Text style={styles.example}>"{item.word.example}"</Text> : null}

            <View style={styles.customDefsSection}>
                {item.customDefinitions.map((def, index) => (
                    <View key={def.id} style={styles.customDefRow}>
                        <Text style={styles.customDefText}>
                            {index + 1}. {def.text}
                        </Text>
                        <TouchableOpacity onPress={() => handleRemoveDefinition(item.id, def.id)} hitSlop={8}>
                            <Icon name="x" size={13} color={colors.textPlaceholder} />
                        </TouchableOpacity>
                    </View>
                ))}
                {addingDefinitionForId === item.id ? (
                    <View style={styles.customDefInputRow}>
                        <TextInput
                            style={styles.customDefInput}
                            value={newDefinitionText}
                            onChangeText={setNewDefinitionText}
                            placeholder="직접 추가할 뜻을 입력하세요"
                            placeholderTextColor={colors.textPlaceholder}
                            autoFocus
                        />
                        <TouchableOpacity
                            onPressIn={() => submitDefinition(item.id)}
                            disabled={!newDefinitionText.trim()}
                            hitSlop={8}
                        >
                            <Text
                                style={[
                                    styles.editSaveText,
                                    !newDefinitionText.trim() && styles.editSaveTextDisabled,
                                ]}
                            >
                                추가
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPressIn={cancelAddDefinition} hitSlop={8}>
                            <Text style={styles.editCancelText}>취소</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => startAddDefinition(item.id)} hitSlop={8}>
                        <Text style={styles.addDefText}>＋추가</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ResponsiveContainer style={styles.container}>
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('Scan', { bookId, language })}
                >
                    <Icon name="camera" size={20} color={colors.primary} />
                    <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>촬영 추가</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('Review', { bookId, bookName })}
                >
                    <Icon name="brain" size={20} color={colors.textSub} />
                    <Text style={styles.actionButtonText}>복습하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('BookShare', { bookId })}
                >
                    <Icon name="share-2" size={20} color={colors.textSub} />
                    <Text style={styles.actionButtonText}>공유</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.75}
                    onPress={() => setShowManualInput(prev => !prev)}
                >
                    <Icon name="keyboard" size={20} color={colors.textSub} />
                    <Text style={styles.actionButtonText}>직접 입력</Text>
                </TouchableOpacity>
            </View>

            {showManualInput ? (
                <View style={styles.manualCard}>
                    <TextField
                        placeholder="단어를 입력하세요 (쉼표나 줄바꿈으로 여러 개 가능)"
                        value={manualText}
                        onChangeText={setManualText}
                        multiline
                        autoFocus
                    />
                    <View style={styles.manualButtonRow}>
                        <Button
                            label="취소"
                            variant="ghost"
                            onPress={() => {
                                setShowManualInput(false);
                                setManualText('');
                            }}
                            style={styles.manualCancelButton}
                        />
                        <Button
                            label="추가"
                            onPressIn={handleManualAdd}
                            disabled={!manualText.trim()}
                            style={styles.manualConfirmButton}
                        />
                    </View>
                </View>
            ) : null}

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
        </ResponsiveContainer>
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
    actionButtonText: { fontSize: 12, fontWeight: '700', color: colors.textSub },
    actionButtonTextPrimary: { color: colors.primary },
    manualCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    manualButtonRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
    manualCancelButton: { flex: 1 },
    manualConfirmButton: { flex: 2 },
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
    headerSpacer: { flex: 1 },
    tag: {
        backgroundColor: colors.primaryLight,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
    },
    tagText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    pronunciation: { ...typography.caption, marginTop: 4 },
    meaningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.sm },
    meaning: { fontSize: 15, color: colors.textMain, flex: 1 },
    editBox: { marginTop: spacing.sm },
    editInput: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        minHeight: 48,
        textAlignVertical: 'top',
        fontSize: 14,
        color: colors.textMain,
    },
    editButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.lg, marginTop: spacing.sm },
    editCancelText: { fontSize: 13, fontWeight: '700', color: colors.textSub },
    editSaveText: { fontSize: 13, fontWeight: '700', color: colors.primary },
    editSaveTextDisabled: { color: colors.textDisabled },
    example: { ...typography.caption, marginTop: spacing.sm, fontStyle: 'italic' },
    customDefsSection: { marginTop: spacing.sm, gap: spacing.xs },
    customDefRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    customDefText: { fontSize: 14, color: colors.textSub, flex: 1 },
    customDefInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    customDefInput: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        fontSize: 14,
        color: colors.textMain,
    },
    addDefText: { fontSize: 13, fontWeight: '700', color: colors.primary },
    empty: { textAlign: 'center', color: colors.textPlaceholder, marginTop: 40 },
    emptyContainer: { flexGrow: 1 },
});
