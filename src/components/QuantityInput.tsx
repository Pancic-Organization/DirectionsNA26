import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../theme';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export default function QuantityInput({
  value,
  onChange,
  min = 0,
  max = 99999,
  label,
}: QuantityInputProps) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const handleTextChange = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    } else if (text === '') {
      onChange(min);
    }
  };

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.container}>
        <TouchableOpacity
          onPress={decrement}
          style={styles.button}
          disabled={value <= min}
        >
          <MaterialCommunityIcons
            name="minus"
            size={20}
            color={value <= min ? colors.textTertiary : colors.primary}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={String(value)}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          textAlign="center"
        />
        <TouchableOpacity
          onPress={increment}
          style={styles.button}
          disabled={value >= max}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={value >= max ? colors.textTertiary : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
  },
  button: {
    padding: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
});
