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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  getPurchaseOrder,
  getPurchaseOrderLines,
  deletePurchaseOrder,
  updatePurchaseOrder,
  receiveAndInvoice,
} from '../services/bcApi';
import { PurchaseOrder, PurchaseOrderLine, DashboardStackParamList } from '../types';
import StatusBadge from '../components/StatusBadge';
import CurrencyDisplay from '../components/CurrencyDisplay';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import SectionHeader from '../components/SectionHeader';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';

type RouteType = RouteProp<DashboardStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteType>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [lines, setLines] = useState<PurchaseOrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [orderData, linesData] = await Promise.all([
        getPurchaseOrder(orderId),
        getPurchaseOrderLines(orderId),
      ]);
      setOrder(orderData);
      setLines(linesData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orderId]);

  const handleDelete = () => {
    Alert.alert('Delete Order', 'Are you sure you want to delete this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await deletePurchaseOrder(orderId);
            Alert.alert('Deleted', 'Purchase order deleted.');
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleReceiveAndInvoice = () => {
    Alert.alert(
      'Receive & Invoice',
      'This will receive and invoice the purchase order. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setActionLoading(true);
            try {
              await receiveAndInvoice(orderId);
              Alert.alert('Success', 'Order has been received and invoiced.');
              fetchData();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingOverlay visible={true} message="Loading order..." />
      </SafeAreaView>
    );
  }

  const displayStatus = order.fullyReceived ? 'Received' : order.status;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <LoadingOverlay visible={actionLoading} message="Processing..." />

      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PO-{order.number}</Text>
        <StatusBadge status={displayStatus} size="sm" />
      </View>

      <ScrollView style={styles.container}>
        {/* Vendor Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <MaterialCommunityIcons name="domain" size={20} color={colors.primary} />
            <Text style={styles.cardLabel}>Vendor</Text>
          </View>
          <Text style={styles.vendorName}>{order.vendorName}</Text>
          <Text style={styles.vendorNumber}>#{order.vendorNumber}</Text>
          {order.buyFromAddressLine1 ? (
            <Text style={styles.address}>
              {order.buyFromAddressLine1}
              {order.buyFromCity ? `, ${order.buyFromCity}` : ''}
              {order.buyFromState ? `, ${order.buyFromState}` : ''}
            </Text>
          ) : null}
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Date</Text>
            <Text style={styles.detailValue}>
              {new Date(order.orderDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Posting Date</Text>
            <Text style={styles.detailValue}>
              {new Date(order.postingDate).toLocaleDateString()}
            </Text>
          </View>
          {order.requestedReceiptDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Requested Receipt</Text>
              <Text style={styles.detailValue}>
                {new Date(order.requestedReceiptDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          {order.currencyCode && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Currency</Text>
              <Text style={styles.detailValue}>{order.currencyCode}</Text>
            </View>
          )}
        </View>

        {/* Totals Card */}
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Subtotal</Text>
            <CurrencyDisplay amount={order.totalAmountExcludingTax} size="sm" />
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tax</Text>
            <CurrencyDisplay amount={order.totalTaxAmount} size="sm" />
          </View>
          {order.discountAmount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Discount</Text>
              <CurrencyDisplay amount={-order.discountAmount} size="sm" color={colors.success} />
            </View>
          )}
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <CurrencyDisplay
              amount={order.totalAmountIncludingTax}
              size="lg"
              color={colors.primary}
            />
          </View>
        </View>

        {/* Line Items */}
        <SectionHeader title={`Line Items (${lines.length})`} />
        {lines.map((line) => (
          <View key={line.id} style={styles.lineCard}>
            <View style={styles.lineHeader}>
              <Text style={styles.lineName} numberOfLines={1}>
                {line.description || line.lineObjectNumber}
              </Text>
              <CurrencyDisplay amount={line.amountIncludingTax} size="sm" />
            </View>
            <Text style={styles.lineDetail}>
              {line.quantity} × ${line.directUnitCost.toFixed(2)}
              {line.discountPercent > 0 ? ` (${line.discountPercent}% off)` : ''}
            </Text>
            {line.receivedQuantity > 0 && (
              <Text style={styles.lineReceived}>
                Received: {line.receivedQuantity} / {line.quantity}
              </Text>
            )}
          </View>
        ))}

        {/* Actions */}
        <View style={styles.actions}>
          {order.status === 'Draft' && (
            <>
              <ActionButton
                title="Edit Order"
                onPress={() =>
                  navigation.navigate('EditOrder', { orderId: order.id })
                }
                variant="outline"
                icon={<MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />}
                style={{ marginBottom: spacing.sm }}
              />
              <ActionButton
                title="Delete Order"
                onPress={handleDelete}
                variant="danger"
                icon={<MaterialCommunityIcons name="delete" size={18} color={colors.white} />}
                style={{ marginBottom: spacing.sm }}
              />
            </>
          )}
          {order.status === 'Open' && !order.fullyReceived && (
            <>
              <ActionButton
                title="Receive & Invoice"
                onPress={handleReceiveAndInvoice}
                icon={
                  <MaterialCommunityIcons name="check-decagram" size={18} color={colors.white} />
                }
                style={{ marginBottom: spacing.sm }}
              />
              <ActionButton
                title="Edit Order"
                onPress={() =>
                  navigation.navigate('EditOrder', { orderId: order.id })
                }
                variant="outline"
                icon={<MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />}
                style={{ marginBottom: spacing.sm }}
              />
            </>
          )}
        </View>
        <View style={{ height: 32 }} />
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
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  vendorName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  vendorNumber: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  address: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  lineCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginRight: spacing.sm,
  },
  lineDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  lineReceived: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
  actions: {
    padding: spacing.lg,
  },
});
