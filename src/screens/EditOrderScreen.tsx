import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  getPurchaseOrder,
  getPurchaseOrderLines,
  updatePurchaseOrder,
  createPurchaseOrderLine,
  updatePurchaseOrderLine,
  deletePurchaseOrderLine,
} from '../services/bcApi';
import { PurchaseOrder, PurchaseOrderLine, OrdersStackParamList } from '../types';
import FormInput from '../components/FormInput';
import ActionButton from '../components/ActionButton';
import QuantityInput from '../components/QuantityInput';
import CurrencyDisplay from '../components/CurrencyDisplay';
import LoadingOverlay from '../components/LoadingOverlay';
import SectionHeader from '../components/SectionHeader';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';

type RouteType = RouteProp<OrdersStackParamList, 'EditOrder'>;

export default function EditOrderScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteType>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [lines, setLines] = useState<PurchaseOrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderDate, setOrderDate] = useState('');
  const [receiptDate, setReceiptDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [orderId]);

  const fetchData = async () => {
    try {
      const [orderData, linesData] = await Promise.all([
        getPurchaseOrder(orderId),
        getPurchaseOrderLines(orderId),
      ]);
      setOrder(orderData);
      setLines(linesData);
      setOrderDate(orderData.orderDate?.split('T')[0] || '');
      setReceiptDate(orderData.requestedReceiptDate?.split('T')[0] || '');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateLineLocally = (lineId: string, updates: Partial<PurchaseOrderLine>) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, ...updates } : l))
    );
  };

  const removeLineHandler = async (lineId: string) => {
    Alert.alert('Remove Line', 'Delete this line item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePurchaseOrderLine(orderId, lineId);
            setLines((prev) => prev.filter((l) => l.id !== lineId));
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update order header
      await updatePurchaseOrder(orderId, {
        orderDate,
        requestedReceiptDate: receiptDate || undefined,
      } as any);

      // Update each line
      for (const line of lines) {
        await updatePurchaseOrderLine(orderId, line.id, {
          quantity: line.quantity,
          directUnitCost: line.directUnitCost,
          discountPercent: line.discountPercent,
        });
      }

      Alert.alert('Saved', 'Order updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingOverlay visible={true} message="Loading order..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <LoadingOverlay visible={saving} message="Saving..." />

      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit PO-{order.number}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <FormInput
            label="Vendor"
            value={order.vendorName}
            onChangeText={() => {}}
            editable={false}
          />
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

          <SectionHeader title={`Line Items (${lines.length})`} />
          {lines.map((line) => (
            <View key={line.id} style={styles.lineCard}>
              <View style={styles.lineHeader}>
                <Text style={styles.lineName} numberOfLines={1}>
                  {line.description || line.lineObjectNumber}
                </Text>
                <TouchableOpacity onPress={() => removeLineHandler(line.id)}>
                  <MaterialCommunityIcons name="close-circle" size={22} color={colors.error} />
                </TouchableOpacity>
              </View>
              <View style={styles.lineFields}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <QuantityInput
                    label="Qty"
                    value={line.quantity}
                    onChange={(v) => updateLineLocally(line.id, { quantity: v })}
                    min={1}
                  />
                </View>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <FormInput
                    label="Unit Cost"
                    value={String(line.directUnitCost)}
                    onChangeText={(t) =>
                      updateLineLocally(line.id, { directUnitCost: parseFloat(t) || 0 })
                    }
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FormInput
                    label="Disc %"
                    value={String(line.discountPercent)}
                    onChangeText={(t) =>
                      updateLineLocally(line.id, { discountPercent: parseFloat(t) || 0 })
                    }
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>
          ))}

          <ActionButton
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: spacing.lg }}
          />
          <ActionButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{ marginTop: spacing.sm, marginBottom: spacing.xxl }}
          />
        </View>
      </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
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
});
