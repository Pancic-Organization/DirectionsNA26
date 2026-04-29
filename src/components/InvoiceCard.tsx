import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PurchaseInvoice } from '../types';
import StatusBadge from './StatusBadge';
import CurrencyDisplay from './CurrencyDisplay';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';

interface InvoiceCardProps {
  invoice: PurchaseInvoice;
  onPress: () => void;
}

export default function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.number}>INV-{invoice.number}</Text>
        <StatusBadge status={invoice.status || 'Posted'} size="sm" />
      </View>
      <Text style={styles.vendor} numberOfLines={1}>
        {invoice.vendorName}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(invoice.postingDate).toLocaleDateString()}
        </Text>
        <CurrencyDisplay amount={invoice.totalAmountIncludingTax} size="md" color={colors.text} />
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
