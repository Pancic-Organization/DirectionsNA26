import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getPurchaseOrders } from '../services/bcApi';
import { PurchaseOrder, DashboardStackParamList } from '../types';
import OrderCard from '../components/OrderCard';
import SectionHeader from '../components/SectionHeader';
import CurrencyDisplay from '../components/CurrencyDisplay';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';

type Nav = NativeStackNavigationProp<DashboardStackParamList, 'DashboardHome'>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await getPurchaseOrders({
        $orderby: 'orderDate desc',
        $top: 50,
      });
      setOrders(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const openOrders = orders.filter((o) => o.status === 'Open' && !o.fullyReceived);
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.orderDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const pendingReceipt = orders.filter((o) => o.status === 'Open' && !o.fullyReceived);
  const totalAmount = openOrders.reduce((sum, o) => sum + o.totalAmountIncludingTax, 0);
  const recentOrders = orders.slice(0, 5);

  const summaryCards = [
    { title: 'Open Orders', value: String(openOrders.length), icon: 'file-document-outline', color: colors.primary },
    { title: 'This Month', value: String(thisMonth.length), icon: 'calendar-month', color: colors.warning },
    { title: 'Pending Receipt', value: String(pendingReceipt.length), icon: 'truck-delivery-outline', color: colors.statusInReview },
    { title: 'Total Amount', value: null, amount: totalAmount, icon: 'currency-usd', color: colors.success },
  ];

  const quickActions = [
    { title: 'New Order', icon: 'plus-circle', onPress: () => navigation.navigate('CreateOrder', {}) },
    { title: 'Scan Doc', icon: 'camera', onPress: () => Alert.alert('Coming Soon', 'Document scanning will be available in a future update.') },
    { title: 'All Orders', icon: 'format-list-bulleted', onPress: () => (navigation as any).navigate('OrdersTab') },
    { title: 'Invoices', icon: 'receipt', onPress: () => (navigation as any).navigate('InvoicesTab') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Purchase Order Management</Text>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Summary Cards */}
        <View style={styles.cardsGrid}>
          {summaryCards.map((card, i) => (
            <View key={i} style={styles.summaryCard}>
              <View style={[styles.cardIcon, { backgroundColor: card.color + '20' }]}>
                <MaterialCommunityIcons name={card.icon as any} size={24} color={card.color} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              {card.amount !== undefined ? (
                <CurrencyDisplay amount={card.amount} size="md" color={colors.text} />
              ) : (
                <Text style={styles.cardValue}>{card.value}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          {quickActions.map((action, i) => (
            <TouchableOpacity key={i} style={styles.actionButton} onPress={action.onPress}>
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons name={action.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Orders */}
        <SectionHeader
          title="Recent Orders"
          action={
            <TouchableOpacity onPress={() => (navigation as any).navigate('OrdersTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          }
        />
        {recentOrders.length === 0 && !loading ? (
          <Text style={styles.emptyText}>No orders yet</Text>
        ) : (
          recentOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
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
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -1,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    margin: '1%',
    ...shadows.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: fontSize.md,
    paddingVertical: spacing.xxl,
  },
});
