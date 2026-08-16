import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Icon from './Icon';
import { colors, radius, spacing, typography } from '../theme';

type Props = TextInputProps & {
    label?: string;
};

export default function TextField({ label, style, onFocus, onBlur, secureTextEntry, ...rest }: Props) {
    const [focused, setFocused] = useState(false);
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.wrap}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <View style={styles.inputWrap}>
                <TextInput
                    style={[
                        styles.input,
                        focused && styles.inputFocused,
                        secureTextEntry && styles.inputWithToggle,
                        style,
                    ]}
                    placeholderTextColor={colors.textPlaceholder}
                    secureTextEntry={secureTextEntry && !visible}
                    onFocus={e => {
                        setFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={e => {
                        setFocused(false);
                        onBlur?.(e);
                    }}
                    {...rest}
                />
                {secureTextEntry ? (
                    <TouchableOpacity
                        style={styles.toggle}
                        onPress={() => setVisible(prev => !prev)}
                        hitSlop={8}
                    >
                        <Icon name={visible ? 'eye-off' : 'eye'} size={18} color={colors.textPlaceholder} />
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginBottom: spacing.md },
    label: { ...typography.label, marginBottom: spacing.xs },
    inputWrap: { justifyContent: 'center' },
    input: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        fontSize: 16,
        color: colors.textMain,
        borderWidth: 1.5,
        borderColor: colors.surface,
    },
    inputWithToggle: { paddingRight: spacing.xxl + spacing.lg },
    toggle: {
        position: 'absolute',
        right: spacing.lg,
        height: '100%',
        justifyContent: 'center',
    },
    inputFocused: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
});
