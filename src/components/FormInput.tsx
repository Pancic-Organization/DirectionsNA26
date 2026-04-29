import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../theme';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  multiline?: boolean;
  editable?: boolean;
  secureTextEntry?: boolean;
  error?: string;
}

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  editable = true,
  secureTextEntry = false,
  error,
}: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          !editable && styles.disabled,
          error ? styles.errorBorder : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
        secureTextEntry={secureTextEntry}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabled: {
    backgroundColor: colors.borderLight,
    color: colors.textSecondary,
  },
  errorBorder: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
