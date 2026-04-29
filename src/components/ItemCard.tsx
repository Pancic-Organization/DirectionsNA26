import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Item } from '../types';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';
import CurrencyDisplay from './CurrencyDisplay';

interface ItemCardProps {
  item: Item;
  selected?: boolean;
}

export default function ItemCard({ item, selected }: ItemCardProps) {
  return (
    <View style={[styles.card, selected && styles.selected]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="package-variant" size={24} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.displayName}
        </Text>
        <Text style={styles.number}>#{item.number}</Text>
        <View style={styles.row}>
          <Text style={styles.detail}>Cost: </Text>
          <CurrencyDisplay amount={item.unitCost} size="sm" />
          <Text style={styles.detail}>  •  Stock: {item.inventory}</Text>
        </View>
      </View>
      {selected && (
        <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    ...shadows.sm,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  number: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detail: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
});
