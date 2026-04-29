import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  RootTabParamList,
  DashboardStackParamList,
  OrdersStackParamList,
  CreateStackParamList,
  InvoicesStackParamList,
  SettingsStackParamList,
} from '../types';
import { colors } from '../theme';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import OrderListScreen from '../screens/OrderListScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import CreateOrderScreen from '../screens/CreateOrderScreen';
import EditOrderScreen from '../screens/EditOrderScreen';
import ScanDocumentScreen from '../screens/ScanDocumentScreen';
import PostedInvoicesScreen from '../screens/PostedInvoicesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const CreateStack = createNativeStackNavigator<CreateStackParamList>();
const InvoicesStack = createNativeStackNavigator<InvoicesStackParamList>();
const SettingsStackNav = createNativeStackNavigator<SettingsStackParamList>();

function DashboardNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <DashboardStack.Screen name="CreateOrder" component={CreateOrderScreen} />
      <DashboardStack.Screen name="EditOrder" component={EditOrderScreen} />
    </DashboardStack.Navigator>
  );
}

function OrdersNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="OrderList" component={OrderListScreen} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <OrdersStack.Screen name="EditOrder" component={EditOrderScreen} />
    </OrdersStack.Navigator>
  );
}

function CreateNavigator() {
  return (
    <CreateStack.Navigator screenOptions={{ headerShown: false }}>
      <CreateStack.Screen name="CreateOrder" component={CreateOrderScreen} />
      <CreateStack.Screen name="ScanDocument" component={ScanDocumentScreen} />
    </CreateStack.Navigator>
  );
}

function InvoicesNavigator() {
  return (
    <InvoicesStack.Navigator screenOptions={{ headerShown: false }}>
      <InvoicesStack.Screen name="InvoiceList" component={PostedInvoicesScreen} />
    </InvoicesStack.Navigator>
  );
}

function SettingsNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <SettingsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStackNav.Screen name="SettingsHome">
        {() => <SettingsScreen onLogout={onLogout} />}
      </SettingsStackNav.Screen>
    </SettingsStackNav.Navigator>
  );
}

interface AppNavigatorProps {
  onLogout: () => void;
}

export default function AppNavigator({ onLogout }: AppNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingBottom: 4,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'home';
          switch (route.name) {
            case 'DashboardTab':
              iconName = 'home';
              break;
            case 'OrdersTab':
              iconName = 'file-document';
              break;
            case 'CreateTab':
              iconName = 'plus-circle';
              break;
            case 'InvoicesTab':
              iconName = 'receipt';
              break;
            case 'SettingsTab':
              iconName = 'cog';
              break;
          }
          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardNavigator}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersNavigator}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateNavigator}
        options={{ tabBarLabel: 'Create' }}
      />
      <Tab.Screen
        name="InvoicesTab"
        component={InvoicesNavigator}
        options={{ tabBarLabel: 'Invoices' }}
      />
      <Tab.Screen
        name="SettingsTab"
        options={{ tabBarLabel: 'Settings' }}
      >
        {() => <SettingsNavigator onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
