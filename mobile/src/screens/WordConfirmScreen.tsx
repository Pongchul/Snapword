import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Tts from 'react-native-tts';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import * as wordsApi from '../apis/words';
import * as booksApi from '../apis/books';
import { WordDto } from '../apis/words';
import ApiError from '../apis/apiError';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { colors, radius, shadow, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'WordConfirm'>;

type Entry = {
    text: string;
    word: WordDto | null;
    note: string;
    failed: boolean;
};

export default function WordConfirmScreen({ route, navigation }: Props) {
    const { bookId, texts, language } = route.params;
    const [entries, setEntries] = useState<Entry[] | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            const results = await Promise.all(
                texts.map(async text => {
                    try {
                        const word = await wordsApi.lookupWord(text, language);
                        return { text, word, note: '', failed: false };
                    } catch {
                        return { text, word: null, note: '', failed: true };
                    }
                }),
            );
            setEntries(results);
            if (results.every(entry => entry.failed)) {
                Alert.alert('사전 조회 실패', '선택한 단어를 찾지 못했어요.');
                navigation.goBack();
            }
        })();
    }, [texts, language, navigation]);

    const speak = (text: string) => {
        Tts.setDefaultLanguage(language === 'JA' ? 'ja-JP' : 'en-US').catch(() => {});
        Tts.speak(text);
    };

    const updateNote = (text: string, note: string) => {
        setEntries(prev => prev && prev.map(entry => (entry.text === text ? { ...entry, note } : entry)));
    };

    const handleSave = async () => {
        if (!entries) return;
        const toSave = entries.filter(entry => entry.word);
        if (toSave.length === 0) return;
        setSaving(true);
        try {
            const results = await Promise.allSettled(
                toSave.map(entry =>
                    booksApi.addBookWord(bookId, { wordId: entry.word!.id, note: entry.note.trim() || undefined }),
                ),
            );
            const failCount = results.filter(result => result.status === 'rejected').length;
            if (failCount > 0) {
                Alert.alert('일부 저장 실패', `${failCount}개 단어를 저장하지 못했어요.`);
            } else {
                navigation.pop(2);
            }
        } finally {
            setSaving(false);
        }
    };

    if (!entries) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const savableCount = entries.filter(entry => entry.word).length;

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>단어 확인</Text>
            <Text style={styles.screenSubtitle}>인식된 단어를 확인하고 저장하세요 ({entries.length}개)</Text>

            <ScrollView contentContainerStyle={styles.list}>
                {entries.map(entry =>
                    entry.word ? (
                        <View key={entry.text} style={styles.card}>
                            <View style={styles.wordHeader}>
                                <Text style={styles.wordText}>{entry.word.text}</Text>
                                <TouchableOpacity onPress={() => speak(entry.word!.text)} hitSlop={8}>
                                    <Icon name="volume-2" size={20} color={colors.textSub} />
                                </TouchableOpacity>
                                {entry.word.partOfSpeech ? (
                                    <View style={styles.tag}>
                                        <Text style={styles.tagText}>{entry.word.partOfSpeech}</Text>
                                    </View>
                                ) : null}
                            </View>
                            {entry.word.pronunciation ? (
                                <Text style={styles.pronunciation}>[{entry.word.pronunciation}]</Text>
                            ) : null}

                            <Text style={styles.meaning}>{entry.word.definitionKo ?? entry.word.definitionEn}</Text>
                            {entry.word.definitionKo && entry.word.definitionEn ? (
                                <Text style={styles.meaningEn}>{entry.word.definitionEn}</Text>
                            ) : null}
                            {entry.word.example ? <Text style={styles.example}>"{entry.word.example}"</Text> : null}

                            <TextInput
                                style={styles.noteInput}
                                placeholder="메모 (선택)"
                                placeholderTextColor={colors.textPlaceholder}
                                value={entry.note}
                                onChangeText={note => updateNote(entry.text, note)}
                                multiline
                            />
                        </View>
                    ) : (
                        <View key={entry.text} style={[styles.card, styles.cardFailed]}>
                            <Text style={styles.wordText}>{entry.text}</Text>
                            <Text style={styles.failedText}>사전에서 찾지 못했어요.</Text>
                        </View>
                    ),
                )}
            </ScrollView>

            <View style={styles.buttonRow}>
                <Button label="취소" variant="ghost" onPress={() => navigation.goBack()} style={styles.discardButton} />
                <Button
                    label={saving ? '저장 중...' : `단어장에 저장 (${savableCount})`}
                    onPress={handleSave}
                    loading={saving}
                    disabled={savableCount === 0}
                    style={styles.saveButton}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    screenTitle: { ...typography.heading },
    screenSubtitle: { ...typography.caption, marginTop: 2, marginBottom: spacing.lg },
    list: { paddingBottom: spacing.lg, gap: spacing.lg },
    card: {
        backgroundColor: colors.background,
        borderRadius: radius.xxl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.xl,
        ...shadow.card,
    },
    cardFailed: { borderColor: colors.dangerLight, backgroundColor: colors.dangerLight },
    failedText: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
    wordHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    wordText: { fontSize: 28, fontWeight: '800', color: colors.textMain },
    tag: {
        backgroundColor: colors.primaryLight,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
    },
    tagText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    pronunciation: { ...typography.caption, marginTop: 4 },
    meaning: { fontSize: 18, color: colors.textMain, marginTop: spacing.lg, fontWeight: '600' },
    meaningEn: { ...typography.caption, marginTop: spacing.xs },
    example: { ...typography.caption, marginTop: spacing.md, fontStyle: 'italic' },
    noteInput: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginTop: spacing.xl,
        minHeight: 56,
        textAlignVertical: 'top',
        fontSize: 14,
        color: colors.textMain,
    },
    buttonRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    discardButton: { flex: 1 },
    saveButton: { flex: 2 },
});
