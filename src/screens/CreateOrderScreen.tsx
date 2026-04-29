import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { getVendors, getItems, createPurchaseOrder, createPurchaseOrderLine } from '../services/bcApi';
import { Vendor, Item, DraftOrder, DraftOrderLine, CreateStackParamList } from '../types';
import VendorCard from '../components/VendorCard';
import ItemCard from '../components/ItemCard';
import FormInput from '../components/FormInput';
import ActionButton from '../components/ActionButton';
import SearchableList from '../components/SearchableList';
import QuantityInput from '../components/QuantityInput';
import CurrencyDisplay from '../components/CurrencyDisplay';
import LoadingOverlay from '../components/LoadingOverlay';
import SectionHeader from '../components/SectionHeader';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';

type Nav = NativeStackNavigationProp<CreateStackParamList, 'CreateOrder'>;
type RouteType = RouteProp<CreateStackParamList, 'CreateOrder'>;

export default function CreateOrderScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const prefillData = route.params?.prefillData;

  const [step, setStep] = useState(1);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Draft state
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [orderLines, setOrderLines] = useState<DraftOrderLine[]>([]);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptDate, setReceiptDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (prefillData) {
      setSelectedVendor({
        id: prefillData.vendorId,
        number: prefillData.vendorNumber,
        displayName: prefillData.vendorName,
      } as Vendor);
      setOrderLines(prefillData.lines);
      setNotes(prefillData.notes);
      setStep(4); // Go directly to review
    }
  }, [prefillData]);

  const loadVendors = useCallback(async () => {
    setLoadingVendors(true);
    try {
      const data = await getVendors({ $orderby: 'displayName' });
      setVendors(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load vendors');
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const data = await getItems({ $filter: "blocked eq false", $orderby: 'displayName' });
      setItems(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load items');
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    if (step === 1) loadVendors();
    if (step === 2) loadItems();
  }, [step, loadVendors, loadItems]);

  const addLineItem = (item: Item) => {
    const existing = orderLines.find((l) => l.itemId === item.id);
    if (existing) {
      setOrderLines((prev) =>
        prev.map((l) =>
          l.itemId === item.id ? { ...l, quantity: l.quantity + 1 } : l
        )
      );
      return;
    }
    const newLine: DraftOrderLine = {
      tempId: `temp_${Date.now()}`,
      itemId: item.id,
      itemNumber: item.number,
      description: item.displayName,
      quantity: 1,
      directUnitCost: item.unitCost,
      discountPercent: 0,
      unitOfMeasureCode: item.baseUnitOfMeasureCode,
      lineType: 'Item',
    };
    setOrderLines((prev) => [...prev, newLine]);
  };

  const updateLine = (tempId: string, updates: Partial<DraftOrderLine>) => {
    setOrderLines((prev) =>
      prev.map((l) => (l.tempId === tempId ? { ...l, ...updates } : l))
    );
  };

  const removeLine = (tempId: string) => {
    setOrderLines((prev) => prev.filter((l) => l.tempId !== tempId));
  };

  const lineTotal = (line: DraftOrderLine) => {
    const subtotal = line.quantity * line.directUnitCost;
    return subtotal - subtotal * (line.discountPercent / 100);
  };

  const grandTotal = orderLines.reduce((sum, l) => sum + lineTotal(l), 0);

  const handleSubmit = async () => {
    if (!selectedVendor) return;
    setSubmitting(true);
    try {
      const poData: any = {
        vendorId: selectedVendor.id,
        vendorNumber: selectedVendor.number,
        orderDate,
      };
      if (receiptDate) poData.requestedReceiptDate = receiptDate;

      const po = await createPurchaseOrder(poData);

      // Create lines
      for (const line of orderLines) {
        await createPurchaseOrderLine(po.id, {
          itemId: line.itemId,
          lineType: line.lineType,
          quantity: line.quantity,
          directUnitCost: line.directUnitCost,
          discountPercent: line.discountPercent,
          unitOfMeasureCode: line.unitOfMeasureCode,
        });
      }

      Alert.alert(
        'Success',
        `Purchase Order PO-${po.number} created successfully!`,
        [
          {
            text: 'View Order',
            onPress: () => {
              (navigation as any).navigate('DashboardTab', {
                screen: 'OrderDetail',
                params: { orderId: po.id },
              });
            },
          },
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
        <View key={s} style={styles.stepRow}>
          <View
            style={[
              styles.stepDot,
              s <= step ? styles.stepDotActive : null,
              s < step ? styles.stepDotDone : null,
            ]}
          >
            {s < step ? (
              <MaterialCommunityIcons name="check" size={14} color={colors.white} />
            ) : (
              <Text style={[styles.stepNumber, s <= step && styles.stepNumberActive]}>
                {s}
              </Text>
            )}
          </View>
          {s < 4 && <View style={[styles.stepLine, s < step && styles.stepLineActive]} />}
        </View>
      ))}
    </View>
  );

  const stepTitles = ['Select Vendor', 'Add Items', 'Order Details', 'Review & Submit'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <LoadingOverlay visible={submitting} message="Creating order..." />

      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stepTitles[step - 1]}</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderStepIndicator()}

      {/* Step 1: Vendor Selection */}
      {step === 1 && (
        <SearchableList
          data={vendors}
          keyExtractor={(v) => v.id}
          renderItem={(v) => (
            <VendorCard vendor={v} selected={selectedVendor?.id === v.id} />
          )}
          onSelect={(v) => {
            setSelectedVendor(v);
            setStep(2);
          }}
          searchPlaceholder="Search vendors..."
          filterFn={(v, q) =>
            v.displayName.toLowerCase().includes(q.toLowerCase()) ||
            v.number.toLowerCase().includes(q.toLowerCase())
          }
          loading={loadingVendors}
          emptyMessage="No vendors found"
        />
      )}

      {/* Step 2: Item Selection */}
      {step === 2 && (
        <View style={{ flex: 1 }}>
          {orderLines.length > 0 && (
            <View style={styles.linesSummary}>
              <Text style={styles.linesCount}>
                {orderLines.length} item(s) added • Total:{' '}
              </Text>
              <CurrencyDisplay amount={grandTotal} size="sm" color={colors.primary} />
            </View>
          )}
          <SearchableList
            data={items}
            keyExtractor={(i) => i.id}
            renderItem={(i) => (
              <ItemCard
                item={i}
                selected={orderLines.some((l) => l.itemId === i.id)}
              />
            )}
            onSelect={addLineItem}
            searchPlaceholder="Search items..."
            filterFn={(i, q) =>
              i.displayName.toLowerCase().includes(q.toLowerCase()) ||
              i.number.toLowerCase().includes(q.toLowerCase())
            }
            loading={loadingItems}
            emptyMessage="No items found"
          />
          {orderLines.length > 0 && (
            <View style={styles.bottomBar}>
              <ActionButton title="Next: Order Details" onPress={() => setStep(3)} />
            </View>
          )}
        </View>
      )}

      {/* Step 3: Order Details */}
      {step === 3 && (
        <ScrollView style={styles.formContainer}>
          <View style={styles.formContent}>
            <FormInput
              label="Order Date"
              value={orderDate}
              onChangeText={setOrderDate}
              placeholder="YYYY-MM-DD"
            />
            <FormInput
              label="Requested Receipt Date"
              value={receiptDate}
              onChangeText={setReceiptDate}
              placeholder="YYYY-MM-DD (optional)"
            />
            <FormInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes..."
              multiline
            />

            <SectionHeader title={`Line Items (${orderLines.length})`} />
            {orderLines.map((line) => (
              <View key={line.tempId} style={styles.lineCard}>
                <View style={styles.lineHeader}>
                  <Text style={styles.lineName} numberOfLines={1}>
                    {line.description}
                  </Text>
                  <TouchableOpacity onPress={() => removeLine(line.tempId)}>
                    <MaterialCommunityIcons name="close-circle" size={22} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <View style={styles.lineFields}>
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <QuantityInput
                      label="Qty"
                      value={line.quantity}
                      onChange={(v) => updateLine(line.tempId, { quantity: v })}
                      min={1}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <FormInput
                      label="Unit Cost"
                      value={String(line.directUnitCost)}
                      onChangeText={(t) =>
                        updateLine(line.tempId, {
                          directUnitCost: parseFloat(t) || 0,
                        })
                      }
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormInput
                      label="Disc %"
                      value={String(line.discountPercent)}
                      onChangeText={(t) =>
                        updateLine(line.tempId, {
                          discountPercent: parseFloat(t) || 0,
                        })
                      }
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
                <View style={styles.lineTotal}>
                  <Text style={styles.lineTotalLabel}>Line Total: </Text>
                  <CurrencyDisplay amount={lineTotal(line)} size="sm" color={colors.primary} />
                </View>
              </View>
            ))}

            <ActionButton
              title="Next: Review"
              onPress={() => setStep(4)}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </ScrollView>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <ScrollView style={styles.formContainer}>
          <View style={styles.formContent}>
            {/* Vendor Info */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Vendor</Text>
              <Text style={styles.reviewValue}>
                {selectedVendor?.displayName} (#{selectedVendor?.number})
              </Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Order Date</Text>
              <Text style={styles.reviewValue}>{orderDate}</Text>
            </View>

            {receiptDate ? (
              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Requested Receipt</Text>
                <Text style={styles.reviewValue}>{receiptDate}</Text>
              </View>
            ) : null}

            <SectionHeader title={`Items (${orderLines.length})`} />
            {orderLines.map((line) => (
              <View key={line.tempId} style={styles.reviewLine}>
                <View style={styles.reviewLineHeader}>
                  <Text style={styles.reviewLineName}>{line.description}</Text>
                  <CurrencyDisplay amount={lineTotal(line)} size="sm" color={colors.text} />
                </View>
                <Text style={styles.reviewLineDetail}>
                  {line.quantity} × ${line.directUnitCost.toFixed(2)}
                  {line.discountPercent > 0 ? ` (${line.discountPercent}% off)` : ''}
                </Text>
              </View>
            ))}

            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <CurrencyDisplay amount={grandTotal} size="lg" color={colors.primary} />
            </View>

            <ActionButton
              title="Submit Purchase Order"
              onPress={handleSubmit}
              loading={submitting}
              style={{ marginTop: spacing.lg }}
            />
            <ActionButton
              title="Back to Edit"
              onPress={() => setStep(3)}
              variant="outline"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  stepDotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepNumber: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: colors.success,
  },
  linesSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
  },
  linesCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  bottomBar: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContent: {
    padding: spacing.lg,
  },
  lineCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lineName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginRight: spacing.sm,
  },
  lineFields: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lineTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  lineTotalLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  reviewSection: {
    marginBottom: spacing.lg,
  },
  reviewLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  reviewValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  reviewLine: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  reviewLineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewLineName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginRight: spacing.sm,
  },
  reviewLineDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    ...shadows.md,
  },
  grandTotalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
});
