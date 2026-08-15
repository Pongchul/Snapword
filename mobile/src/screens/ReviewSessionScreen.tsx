import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import { useReview } from '../hooks/useReview';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { colors, radius, spacing, typography } from '../theme';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

type Props = NativeStackScreenProps<MainStackParamList, 'Review'>;

export default function ReviewSessionScreen({ route, navigation }: Props) {
    const { bookId } = route.params;
    const { queue, isLoading, submitResult } = useReview(bookId);
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [correctCount, setCorrectCount] = useState(0);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (queue.length === 0) {
        return (
            <View style={styles.center}>
                <View style={styles.doneIconWrap}>
                    <Icon name="party-popper" size={36} color={colors.primary} />
                </View>
                <Text style={styles.doneTitle}>오늘 복습할 단어가 없어요</Text>
                <Button label="돌아가기" onPress={() => navigation.goBack()} style={styles.doneButton} />
            </View>
        );
    }

    if (index >= queue.length) {
        return (
            <View style={styles.center}>
                <View style={styles.doneIconWrap}>
                    {correctCount === queue.length ? (
                        <Icon name="trophy" size={36} color={colors.primary} />
                    ) : (
                        <Icon name="circle-check" size={36} color={colors.success} />
                    )}
                </View>
                <Text style={styles.doneTitle}>복습 완료!</Text>
                <Text style={styles.doneSubtitle}>
                    {queue.length}개 중 {correctCount}개 맞혔어요
                </Text>
                <Button label="돌아가기" onPress={() => navigation.goBack()} style={styles.doneButton} />
            </View>
        );
    }

    const question = queue[index];

    const handleSelect = async (choiceIndex: number) => {
        if (selected !== null) return;
        setSelected(choiceIndex);
        const correct = choiceIndex === question.correctIndex;
        if (correct) setCorrectCount(c => c + 1);
        await submitResult(question.bookWordId, correct);
    };

    const handleNext = () => {
        setSelected(null);
        setIndex(i => i + 1);
    };

    return (
        <View style={styles.container}>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${((index + 1) / queue.length) * 100}%` }]} />
            </View>
            <Text style={styles.progress}>
                {index + 1} / {queue.length}
            </Text>

            <Text style={styles.wordText}>{question.wordText}</Text>
            {question.pronunciation ? <Text style={styles.pronunciation}>[{question.pronunciation}]</Text> : null}

            <View style={styles.choices}>
                {question.choices.map((choice, choiceIndex) => {
                    const isCorrectChoice = choiceIndex === question.correctIndex;
                    const isSelected = choiceIndex === selected;
                    const showResult = selected !== null;
                    const isWrongSelected = showResult && isSelected && !isCorrectChoice;
                    const isRightAnswer = showResult && isCorrectChoice;

                    return (
                        <TouchableOpacity
                            key={choiceIndex}
                            style={[styles.choice, isRightAnswer && styles.choiceCorrect, isWrongSelected && styles.choiceWrong]}
                            activeOpacity={0.75}
                            onPress={() => handleSelect(choiceIndex)}
                            disabled={showResult}
                        >
                            <View
                                style={[
                                    styles.choiceBadge,
                                    isRightAnswer && styles.choiceBadgeCorrect,
                                    isWrongSelected && styles.choiceBadgeWrong,
                                ]}
                            >
                                {isRightAnswer ? (
                                    <Icon name="check" size={15} color={colors.white} />
                                ) : isWrongSelected ? (
                                    <Icon name="x" size={15} color={colors.white} />
                                ) : (
                                    <Text style={styles.choiceBadgeText}>{CHOICE_LABELS[choiceIndex]}</Text>
                                )}
                            </View>
                            <Text style={styles.choiceText}>{choice}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {selected !== null ? <Button label="다음" onPress={handleNext} style={styles.nextButton} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.xxl },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
    progressTrack: {
        height: 6,
        borderRadius: radius.pill,
        backgroundColor: colors.surface,
        overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
    progress: { ...typography.small, textAlign: 'right', marginTop: spacing.sm },
    wordText: { fontSize: 32, fontWeight: '800', color: colors.textMain, textAlign: 'center', marginTop: spacing.xxl },
    pronunciation: { ...typography.caption, textAlign: 'center', marginTop: spacing.xs },
    choices: { marginTop: spacing.xxxl, gap: spacing.sm },
    choice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: colors.surface,
        padding: spacing.lg,
    },
    choiceCorrect: { backgroundColor: colors.successLight, borderColor: colors.success },
    choiceWrong: { backgroundColor: colors.dangerLight, borderColor: colors.danger },
    choiceBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    choiceBadgeCorrect: { backgroundColor: colors.success },
    choiceBadgeWrong: { backgroundColor: colors.danger },
    choiceBadgeText: { fontSize: 13, fontWeight: '800', color: colors.textSub },
    choiceText: { flex: 1, fontSize: 16, color: colors.textMain, fontWeight: '600' },
    doneIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    doneTitle: { ...typography.heading, textAlign: 'center' },
    doneSubtitle: { ...typography.body, color: colors.textSub, marginTop: spacing.xs, textAlign: 'center' },
    doneButton: { marginTop: spacing.xxl, minWidth: 160 },
    nextButton: { marginTop: spacing.xxl },
});
