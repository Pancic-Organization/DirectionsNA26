import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../theme';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export default function ActionButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon,
}: ActionButtonProps) {
  const variantStyles = {
    primary: { bg: colors.primary, text: colors.white },
    secondary: { bg: colors.background, text: colors.primary },
    danger: { bg: colors.error, text: colors.white },
    outline: { bg: 'transparent', text: colors.primary },
  };
  const vs = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: vs.bg },
        variant === 'outline' && styles.outlineBorder,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: vs.text }, icon ? { marginLeft: 8 } : undefined]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.sm,
    minHeight: 48,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
