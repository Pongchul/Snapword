import React, { useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import * as booksApi from '../apis/books';
import ApiError from '../apis/apiError';
import Button from '../components/Button';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { colors, radius, shadow, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'BookShare'>;

export default function BookShareScreen({ route }: Props) {
    const { bookId } = route.params;
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await booksApi.generateInviteCode(bookId);
            setInviteCode(result?.inviteCode ?? null);
        } catch (error) {
            Alert.alert('발급 실패', error instanceof ApiError ? error.message : '초대코드를 발급하지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!inviteCode) return;
        await Share.share({
            message: `SnapWord 단어장에 초대할게요! 앱에서 '코드로 참여'에 이 코드를 입력해주세요: ${inviteCode}`,
        });
    };

    return (
        <ResponsiveContainer style={styles.container} maxWidth={480}>
            <Text style={styles.title}>단어장 공유</Text>
            <Text style={styles.description}>
                초대코드를 발급하면 다른 사람이 이 코드로 참여해 함께 단어장을 볼 수 있어요.
            </Text>

            {inviteCode ? (
                <View style={styles.codeBox}>
                    <Text style={styles.codeLabel}>초대코드</Text>
                    <Text style={styles.code}>{inviteCode}</Text>
                </View>
            ) : null}

            <Button
                label={loading ? '발급 중...' : inviteCode ? '코드 다시 발급' : '초대코드 발급'}
                variant={inviteCode ? 'secondary' : 'primary'}
                onPress={handleGenerate}
                loading={loading}
                style={styles.button}
            />

            {inviteCode ? <Button label="공유하기" onPress={handleShare} style={styles.button} /> : null}
        </ResponsiveContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.xxl },
    title: { ...typography.title, fontSize: 22 },
    description: { ...typography.body, color: colors.textSub, marginTop: spacing.sm, marginBottom: spacing.xxl, lineHeight: 20 },
    codeBox: {
        backgroundColor: colors.primaryLight,
        borderRadius: radius.xxl,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
        ...shadow.card,
    },
    codeLabel: { ...typography.label, color: colors.primary, marginBottom: spacing.sm },
    code: { fontSize: 32, fontWeight: '800', letterSpacing: 6, color: colors.primary },
    button: { marginBottom: spacing.md },
});
