import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PurchaseOrder } from '../types';
import StatusBadge from './StatusBadge';
import CurrencyDisplay from './CurrencyDisplay';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';

interface OrderCardProps {
  order: PurchaseOrder;
  onPress: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const displayStatus = order.fullyReceived ? 'Received' : order.status;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.number}>PO-{order.number}</Text>
        <StatusBadge status={displayStatus} size="sm" />
      </View>
      <Text style={styles.vendor} numberOfLines={1}>
        {order.vendorName}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(order.orderDate).toLocaleDateString()}
        </Text>
        <CurrencyDisplay amount={order.totalAmountIncludingTax} size="md" color={colors.text} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  number: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  vendor: {
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
});
