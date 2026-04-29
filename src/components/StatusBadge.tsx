import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, borderRadius, spacing } from '../theme';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Draft: { bg: '#F2F2F7', text: colors.statusDraft },
  Open: { bg: '#E8F4FD', text: colors.statusOpen },
  'In Review': { bg: '#FFF3E0', text: colors.statusInReview },
  Received: { bg: '#E8F5E9', text: colors.statusReceived },
  Posted: { bg: '#E8F5E9', text: colors.statusPosted },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorScheme = statusColors[status] || statusColors.Draft;
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorScheme.bg },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colorScheme.text },
          isSmall && styles.textSmall,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  textSmall: {
    fontSize: fontSize.xs,
  },
});
