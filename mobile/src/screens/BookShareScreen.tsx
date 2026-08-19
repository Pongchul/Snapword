import React, { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alert } from '../components/AppAlert';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import * as booksApi from '../apis/books';
import { BookMemberDto, BookRole } from '../apis/books';
import ApiError from '../apis/apiError';
import Button from '../components/Button';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useAuth } from '../hooks/useAuth';
import { useBookMembers } from '../hooks/useBookMembers';
import { colors, radius, shadow, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'BookShare'>;

export default function BookShareScreen({ route }: Props) {
    const { bookId } = route.params;
    const { member } = useAuth();
    const { members, refresh: refreshMembers } = useBookMembers(bookId);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);

    const me = members.find(m => m.memberId === member?.id);
    const isOwner = me?.role === 'OWNER';

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

    const handleToggleRole = async (target: BookMemberDto) => {
        const nextRole: BookRole = target.role === 'EDITOR' ? 'VIEWER' : 'EDITOR';
        setUpdatingMemberId(target.memberId);
        try {
            await booksApi.updateMemberRole(bookId, target.memberId, nextRole);
            refreshMembers();
        } catch (error) {
            Alert.alert('변경 실패', error instanceof ApiError ? error.message : '권한을 변경하지 못했습니다.');
        } finally {
            setUpdatingMemberId(null);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
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

                {members.length > 0 ? (
                    <View style={styles.membersSection}>
                        <Text style={styles.sectionTitle}>멤버 {members.length}명</Text>
                        {members.map(item => (
                            <View key={item.memberId} style={styles.memberRow}>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{item.nickname}</Text>
                                    <Text style={styles.memberEmail}>{item.email}</Text>
                                </View>
                                {isOwner && item.role !== 'OWNER' ? (
                                    <TouchableOpacity
                                        style={styles.roleChip}
                                        onPress={() => handleToggleRole(item)}
                                        disabled={updatingMemberId === item.memberId}
                                        hitSlop={8}
                                    >
                                        <Text style={styles.roleChipText}>
                                            {updatingMemberId === item.memberId
                                                ? '변경 중...'
                                                : item.role === 'EDITOR'
                                                  ? '편집자'
                                                  : '읽기 전용'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.roleLabel}>
                                        {item.role === 'OWNER' ? '소유자' : item.role === 'EDITOR' ? '편집자' : '보기 전용'}
                                    </Text>
                                )}
                            </View>
                        ))}
                        {isOwner ? <Text style={styles.memberHint}>권한 배지를 눌러 편집자/보기 전용을 전환할 수 있어요.</Text> : null}
                    </View>
                ) : null}
            </ResponsiveContainer>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: { flexGrow: 1 },
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
    membersSection: { marginTop: spacing.xl },
    sectionTitle: { ...typography.heading, marginBottom: spacing.md },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    memberInfo: { flex: 1, marginRight: spacing.sm },
    memberName: { fontSize: 15, fontWeight: '700', color: colors.textMain },
    memberEmail: { ...typography.caption, marginTop: 2 },
    roleLabel: { ...typography.caption, fontWeight: '700', color: colors.textSub },
    roleChip: {
        backgroundColor: colors.primaryLight,
        borderRadius: radius.pill,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
    },
    roleChipText: { fontSize: 12, fontWeight: '700', color: colors.primary },
    memberHint: { ...typography.caption, marginTop: spacing.xs },
});
