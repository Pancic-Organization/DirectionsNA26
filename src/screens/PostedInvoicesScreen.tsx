import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getPurchaseInvoices } from '../services/bcApi';
import { PurchaseInvoice } from '../types';
import InvoiceCard from '../components/InvoiceCard';
import StatusBadge from '../components/StatusBadge';
import CurrencyDisplay from '../components/CurrencyDisplay';
import EmptyState from '../components/EmptyState';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';

export default function PostedInvoicesScreen() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const data = await getPurchaseInvoices({ $orderby: 'postingDate desc' });
      setInvoices(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [fetchInvoices])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvoices();
    setRefreshing(false);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.number.toLowerCase().includes(q) ||
      inv.vendorName.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Posted Invoices</Text>
      </View>

      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search invoices..."
            placeholderTextColor={colors.textTertiary}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={filteredInvoices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <InvoiceCard invoice={item} onPress={() => setSelectedInvoice(item)} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            loading ? null : (
              <EmptyState
                icon="receipt"
                title="No invoices found"
                message={searchQuery ? 'Try adjusting your search' : 'No posted invoices yet'}
              />
            )
          }
          contentContainerStyle={
            filteredInvoices.length === 0 ? { flex: 1 } : { paddingBottom: 24 }
          }
        />
      </View>

      {/* Invoice Detail Modal */}
      <Modal
        visible={!!selectedInvoice}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedInvoice(null)}
      >
        {selectedInvoice && (
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>INV-{selectedInvoice.number}</Text>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalCard}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status</Text>
                  <StatusBadge status={selectedInvoice.status || 'Posted'} />
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Vendor</Text>
                  <Text style={styles.modalValue}>{selectedInvoice.vendorName}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Vendor Number</Text>
                  <Text style={styles.modalValue}>{selectedInvoice.vendorNumber}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Posting Date</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedInvoice.postingDate).toLocaleDateString()}
                  </Text>
                </View>
                {selectedInvoice.invoiceDate && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Invoice Date</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {selectedInvoice.orderNumber && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Order Number</Text>
                    <Text style={styles.modalValue}>{selectedInvoice.orderNumber}</Text>
                  </View>
                )}
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Amount (excl. Tax)</Text>
                  <CurrencyDisplay amount={selectedInvoice.totalAmountExcludingTax} size="sm" />
                </View>
                <View style={[styles.modalRow, styles.modalTotalRow]}>
                  <Text style={styles.modalTotalLabel}>Total (incl. Tax)</Text>
                  <CurrencyDisplay
                    amount={selectedInvoice.totalAmountIncludingTax}
                    size="lg"
                    color={colors.primary}
                  />
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerBar: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  // Modal
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    margin: spacing.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  modalValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  modalTotalRow: {
    borderBottomWidth: 0,
    paddingTop: spacing.lg,
  },
  modalTotalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
});
