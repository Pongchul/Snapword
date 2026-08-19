import React, { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { colors, radius, shadow, spacing, typography } from '../theme';

export type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

export interface AlertButton {
    text?: string;
    style?: AlertButtonStyle;
    onPress?: () => void;
}

interface AlertState {
    visible: boolean;
    title?: string;
    message?: string;
    buttons: AlertButton[];
}

const DEFAULT_BUTTON: AlertButton = { text: '확인', style: 'default' };

let showImpl: ((title?: string, message?: string, buttons?: AlertButton[]) => void) | null = null;

/**
 * RN 기본 Alert.alert와 동일한 시그니처. 화면 쪽 코드는
 * `import { Alert } from 'react-native'` 대신 이 모듈만 가져오면 그대로 동작한다.
 */
export const Alert = {
    alert: (title?: string, message?: string, buttons?: AlertButton[]) => {
        if (showImpl) {
            showImpl(title, message, buttons);
        }
    },
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AlertState>({ visible: false, buttons: [] });

    const hide = useCallback(() => setState(s => ({ ...s, visible: false })), []);

    useEffect(() => {
        showImpl = (title, message, buttons) => {
            setState({
                visible: true,
                title,
                message,
                buttons: buttons && buttons.length > 0 ? buttons : [DEFAULT_BUTTON],
            });
        };
        return () => {
            showImpl = null;
        };
    }, []);

    const handlePress = (button: AlertButton) => {
        hide();
        button.onPress?.();
    };

    const buttonVariant = (style: AlertButtonStyle | undefined) => {
        if (style === 'destructive') return 'danger';
        if (style === 'cancel') return 'ghost';
        return 'primary';
    };

    return (
        <>
            {children}
            <Modal visible={state.visible} transparent animationType="fade" onRequestClose={hide} statusBarTranslucent>
                <View style={styles.backdrop}>
                    <View style={styles.card}>
                        {state.title ? <Text style={styles.title}>{state.title}</Text> : null}
                        {state.message ? <Text style={styles.message}>{state.message}</Text> : null}
                        <View style={styles.buttonRow}>
                            {state.buttons.map((button, index) => (
                                <Button
                                    key={index}
                                    label={button.text ?? '확인'}
                                    variant={buttonVariant(button.style)}
                                    onPress={() => handlePress(button)}
                                    style={[
                                        styles.button,
                                        state.buttons.length === 2 && (index === 0 ? styles.buttonMinor : styles.buttonMajor),
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(25, 31, 40, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
    },
    card: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: colors.background,
        borderRadius: radius.xxl,
        padding: spacing.xl,
        ...shadow.card,
    },
    title: { ...typography.heading, textAlign: 'center' },
    message: { ...typography.body, color: colors.textSub, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
    buttonRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
    button: { flex: 1 },
    buttonMinor: { flex: 1 },
    buttonMajor: { flex: 1.4 },
});
