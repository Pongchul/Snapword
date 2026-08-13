import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { AuthStackParamList } from '../types/navigation';
import ApiError from '../apis/apiError';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await signup(email, password, nickname);
        } catch (error) {
            const message = error instanceof ApiError ? error.message : '회원가입 중 오류가 발생했습니다.';
            Alert.alert('회원가입 실패', message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>몇 가지 정보만 입력하면 바로 시작할 수 있어요</Text>

            <View style={styles.form}>
                <TextField label="닉네임" placeholder="닉네임" value={nickname} onChangeText={setNickname} />
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
                    placeholder="8자 이상, 영문/숫자/특수문자 중 2종류 이상"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Button
                    label={submitting ? '가입 중...' : '가입하기'}
                    onPress={handleSubmit}
                    loading={submitting}
                    style={styles.submitButton}
                />
            </View>

            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
                <Text style={styles.link}>이미 계정이 있으신가요? 로그인</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: spacing.xxl, backgroundColor: colors.background },
    title: { ...typography.title, textAlign: 'center' },
    subtitle: { ...typography.body, color: colors.textSub, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xxxl },
    form: { marginBottom: spacing.xl },
    submitButton: { marginTop: spacing.sm },
    link: { textAlign: 'center', color: colors.primary, fontWeight: '700', fontSize: 14 },
});
