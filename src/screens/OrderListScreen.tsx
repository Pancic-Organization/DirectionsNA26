import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getPurchaseOrders } from '../services/bcApi';
import { PurchaseOrder, OrdersStackParamList } from '../types';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../theme';

type Nav = NativeStackNavigationProp<OrdersStackParamList, 'OrderList'>;

const TABS = ['All', 'Draft', 'Open', 'Received'] as const;

export default function OrderListScreen() {
  const navigation = useNavigation<Nav>();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getPurchaseOrders({ $orderby: 'orderDate desc' });
      setOrders(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (activeTab === 'Received' && !order.fullyReceived) return false;
    if (activeTab === 'Draft' && order.status !== 'Draft') return false;
    if (activeTab === 'Open' && (order.status !== 'Open' || order.fullyReceived))
      return false;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        order.number.toLowerCase().includes(q) ||
        order.vendorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Purchase Orders</Text>
      </View>

      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by order # or vendor..."
            placeholderTextColor={colors.textTertiary}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order List */}
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            loading ? null : (
              <EmptyState
                icon="file-document-outline"
                title="No orders found"
                message={
                  searchQuery || activeTab !== 'All'
                    ? 'Try adjusting your filters'
                    : 'Create your first purchase order'
                }
              />
            )
          }
          contentContainerStyle={filteredOrders.length === 0 ? { flex: 1 } : { paddingBottom: 24 }}
        />
      </View>
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
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
});
