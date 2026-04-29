import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Vendor } from '../types';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';

interface VendorCardProps {
  vendor: Vendor;
  selected?: boolean;
}

export default function VendorCard({ vendor, selected }: VendorCardProps) {
  return (
    <View style={[styles.card, selected && styles.selected]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="domain" size={24} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {vendor.displayName}
        </Text>
        <Text style={styles.number}>#{vendor.number}</Text>
        {vendor.city ? (
          <Text style={styles.detail}>
            {vendor.city}
            {vendor.state ? `, ${vendor.state}` : ''}
          </Text>
        ) : null}
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
  detail: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
