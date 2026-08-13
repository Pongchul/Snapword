import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = TouchableOpacityProps & {
    label: string;
    variant?: Variant;
    loading?: boolean;
    size?: 'md' | 'sm';
};

export default function Button({ label, variant = 'primary', loading, size = 'md', style, disabled, ...rest }: Props) {
    return (
        <TouchableOpacity
            style={[
                styles.base,
                size === 'sm' ? styles.sizeSm : styles.sizeMd,
                variantStyles[variant],
                (disabled || loading) && styles.disabled,
                style,
            ]}
            activeOpacity={0.75}
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary} />
            ) : (
                <Text style={[styles.text, textVariantStyles[variant], size === 'sm' && styles.textSm]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    sizeMd: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.xl },
    sizeSm: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg },
    disabled: { opacity: 0.5 },
    text: { fontSize: 16, fontWeight: '700' },
    textSm: { fontSize: 14 },
});

const variantStyles = StyleSheet.create({
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.primaryLight },
    ghost: { backgroundColor: colors.surface },
    danger: { backgroundColor: colors.danger },
});

const textVariantStyles = StyleSheet.create({
    primary: { color: colors.white },
    secondary: { color: colors.primary },
    ghost: { color: colors.textSub },
    danger: { color: colors.white },
});
