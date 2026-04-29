import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, spacing } from '../theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon = 'inbox-outline',
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon as any}
        size={64}
        color={colors.textTertiary}
      />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.xl,
  },
});
