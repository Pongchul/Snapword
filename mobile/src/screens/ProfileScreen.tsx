import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { colors, radius, shadow, spacing, typography } from '../theme';

export default function ProfileScreen() {
    const { member, logout } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{member?.nickname?.[0]?.toUpperCase()}</Text>
                </View>
                <Text style={styles.nickname}>{member?.nickname}</Text>
                <Text style={styles.email}>{member?.email}</Text>
            </View>

            <Button label="로그아웃" variant="ghost" onPress={logout} style={styles.logoutButton} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
    profileCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.xxl,
        padding: spacing.xxl,
        alignItems: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.xxxl,
        ...shadow.card,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    avatarText: { fontSize: 28, fontWeight: '800', color: colors.primary },
    nickname: { ...typography.heading },
    email: { ...typography.caption, marginTop: 4 },
    logoutButton: {},
});
