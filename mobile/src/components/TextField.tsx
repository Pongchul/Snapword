import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Props = TextInputProps & {
    label?: string;
};

export default function TextField({ label, style, onFocus, onBlur, ...rest }: Props) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={styles.wrap}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                style={[styles.input, focused && styles.inputFocused, style]}
                placeholderTextColor={colors.textPlaceholder}
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
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginBottom: spacing.md },
    label: { ...typography.label, marginBottom: spacing.xs },
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
    inputFocused: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
});
