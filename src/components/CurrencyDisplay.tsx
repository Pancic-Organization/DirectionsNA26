import React from 'react';
import { Text } from 'react-native';
import { fontSize, fontWeight, colors } from '../theme';

interface CurrencyDisplayProps {
  amount: number;
  currencyCode?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function CurrencyDisplay({
  amount,
  currencyCode = 'USD',
  size = 'md',
  color = colors.text,
}: CurrencyDisplayProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    minimumFractionDigits: 2,
  }).format(amount);

  const sizeMap = {
    sm: fontSize.sm,
    md: fontSize.md,
    lg: fontSize.xl,
  };

  return (
    <Text
      style={{
        fontSize: sizeMap[size],
        fontWeight: fontWeight.semibold,
        color,
      }}
    >
      {formatted}
    </Text>
  );
}
