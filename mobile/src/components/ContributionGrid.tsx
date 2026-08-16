import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ReviewActivityDto } from '../apis/review';
import Icon from './Icon';
import { colors, spacing, typography } from '../theme';

type Props = {
    activity: ReviewActivityDto[];
    totalDays?: number;
};

type Cell = { dateKey: string; count: number } | null;

const CELL_SIZE = 12;
const CELL_GAP = 3;

function toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function levelColor(count: number): string {
    if (count <= 0) return colors.border;
    if (count === 1) return 'rgba(0, 196, 113, 0.35)';
    if (count <= 3) return 'rgba(0, 196, 113, 0.55)';
    if (count <= 6) return 'rgba(0, 196, 113, 0.8)';
    return colors.success;
}

function buildWeeks(activityMap: Map<string, number>, totalDays: number): Cell[][] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayDates: Date[] = [];
    for (let i = totalDays - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dayDates.push(d);
    }

    const days: Cell[] = dayDates.map(d => {
        const dateKey = toDateKey(d);
        return { dateKey, count: activityMap.get(dateKey) ?? 0 };
    });

    const leadingBlank = dayDates[0].getDay();
    const padded: Cell[] = [...Array(leadingBlank).fill(null), ...days];

    const weeks: Cell[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
        weeks.push(padded.slice(i, i + 7));
    }
    return weeks;
}

function computeStreak(activityMap: Map<string, number>): number {
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    if ((activityMap.get(toDateKey(cursor)) ?? 0) === 0) {
        cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    while ((activityMap.get(toDateKey(cursor)) ?? 0) > 0) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

export default function ContributionGrid({ activity, totalDays = 371 }: Props) {
    const scrollRef = useRef<ScrollView>(null);
    const activityMap = new Map(activity.map(a => [a.date, a.count]));
    const weeks = buildWeeks(activityMap, totalDays);
    const streak = computeStreak(activityMap);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>학습 잔디</Text>
                {streak > 0 ? (
                    <View style={styles.streakRow}>
                        <Icon name="flame" size={14} color={colors.danger} />
                        <Text style={styles.streak}>{streak}일 연속</Text>
                    </View>
                ) : null}
            </View>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gridScroll}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
                <View style={styles.grid}>
                    {weeks.map((week, weekIndex) => (
                        <View key={weekIndex} style={styles.week}>
                            {week.map((day, dayIndex) =>
                                day ? (
                                    <View
                                        key={day.dateKey}
                                        style={[styles.cell, { backgroundColor: levelColor(day.count) }]}
                                    />
                                ) : (
                                    <View key={dayIndex} style={styles.cellEmpty} />
                                ),
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
            <View style={styles.legendRow}>
                <Text style={styles.legendLabel}>적음</Text>
                {[0, 1, 3, 6, 8].map(level => (
                    <View
                        key={level}
                        style={[styles.cell, styles.legendCell, { backgroundColor: levelColor(level) }]}
                    />
                ))}
                <Text style={styles.legendLabel}>많음</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    title: { ...typography.subheading },
    streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    streak: { fontSize: 13, fontWeight: '700', color: colors.textSub },
    gridScroll: { paddingVertical: spacing.xs },
    grid: { flexDirection: 'row', gap: CELL_GAP },
    week: { flexDirection: 'column', gap: CELL_GAP },
    cell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 3 },
    cellEmpty: { width: CELL_SIZE, height: CELL_SIZE },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm, justifyContent: 'flex-end' },
    legendLabel: { fontSize: 11, color: colors.textPlaceholder },
    legendCell: { marginHorizontal: 1 },
});
