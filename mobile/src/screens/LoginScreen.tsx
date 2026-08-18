import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { AuthStackParamList } from '../types/navigation';
import ApiError from '../apis/apiError';
import Button from '../components/Button';
import TextField from '../components/TextField';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useKeyboardVisible } from '../hooks/useKeyboardVisible';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const keyboardVisible = useKeyboardVisible();

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await login(email, password);
        } catch (error) {
            const message = error instanceof ApiError ? error.message : '로그인 중 오류가 발생했습니다.';
            Alert.alert('로그인 실패', message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[styles.scrollContent, keyboardVisible && styles.scrollContentKeyboard]}
                keyboardShouldPersistTaps="handled"
            >
                <ResponsiveContainer maxWidth={440}>
                    <Image source={require('../assets/logo.png')} style={styles.logoMark} />
                    <Text style={styles.title}>SnapWord</Text>
                    <Text style={styles.subtitle}>사진으로 만드는 나만의 단어장</Text>

                    <View style={styles.form}>
                        <TextField
                            label="이메일"
                            placeholder="you@example.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TextField
                            label="비밀번호"
                            placeholder="비밀번호"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <Button
                            label={submitting ? '로그인 중...' : '로그인'}
                            onPress={handleSubmit}
                            loading={submitting}
                            style={styles.submitButton}
                        />
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('Signup')} hitSlop={8}>
                        <Text style={styles.link}>계정이 없으신가요? 회원가입</Text>
                    </TouchableOpacity>
                </ResponsiveContainer>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardView: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl },
    scrollContentKeyboard: { justifyContent: 'flex-start', paddingTop: spacing.xxl },
    logoMark: {
        width: 64,
        height: 64,
        borderRadius: radius.xl,
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    title: { ...typography.title, textAlign: 'center' },
    subtitle: { ...typography.body, color: colors.textSub, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xxxl },
    form: { marginBottom: spacing.xl },
    submitButton: { marginTop: spacing.sm },
    link: { textAlign: 'center', color: colors.primary, fontWeight: '700', fontSize: 14 },
});
