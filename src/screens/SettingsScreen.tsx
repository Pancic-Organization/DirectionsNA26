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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { testConnection } from '../services/bcApi';
import { UserProfile } from '../types';
import ActionButton from '../components/ActionButton';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';
import { appConfig } from '../config/appConfig';

interface SettingsScreenProps {
  onLogout: () => void;
}

export default function SettingsScreen({ onLogout }: SettingsScreenProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>(
    'checking'
  );

  useEffect(() => {
    loadUser();
    checkConnection();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem('userProfile');
    if (data) setUser(JSON.parse(data));
  };

  const checkConnection = async () => {
    setConnectionStatus('checking');
    const ok = await testConnection();
    setConnectionStatus(ok ? 'connected' : 'error');
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will clear all cached data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          // Keep login state, clear other keys
          const keys = await AsyncStorage.getAllKeys();
          const keysToRemove = keys.filter(
            (k) => k !== 'isLoggedIn' && k !== 'userProfile'
          );
          await AsyncStorage.multiRemove(keysToRemove);
          Alert.alert('Done', 'Cache cleared successfully.');
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          onLogout();
        },
      },
    ]);
  };

  const connectionColors = {
    checking: colors.warning,
    connected: colors.success,
    error: colors.error,
  };

  const connectionLabels = {
    checking: 'Checking...',
    connected: 'Connected',
    error: 'Disconnected',
  };

  const connectionIcons = {
    checking: 'loading' as const,
    connected: 'check-circle' as const,
    error: 'alert-circle' as const,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* User Info */}
        <View style={styles.card}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.username || ''}</Text>
            </View>
          </View>
        </View>

        {/* API Connection */}
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="cloud-outline" size={22} color={colors.primary} />
              <Text style={styles.settingLabel}>BC API Connection</Text>
            </View>
            <TouchableOpacity onPress={checkConnection} style={styles.statusBadge}>
              {connectionStatus !== 'checking' && (
                <MaterialCommunityIcons
                  name={connectionIcons[connectionStatus]}
                  size={16}
                  color={connectionColors[connectionStatus]}
                />
              )}
              <Text style={[styles.statusText, { color: connectionColors[connectionStatus] }]}>
                {connectionLabels[connectionStatus]}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="server" size={22} color={colors.primary} />
              <Text style={styles.settingLabel}>Environment</Text>
            </View>
            <Text style={styles.settingValue}>{appConfig.bc.environment}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="cached" size={22} color={colors.warning} />
              <Text style={styles.settingLabel}>Clear Cached Data</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutText}>
            {appConfig.app.displayName} is a mobile purchase order management app
            integrated with Microsoft Dynamics 365 Business Central. Built for the
            purchase department to streamline order creation, tracking, and invoice
            management.
          </Text>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Version</Text>
            <Text style={styles.versionValue}>1.0.0</Text>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <ActionButton
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            icon={<MaterialCommunityIcons name="logout" size={18} color={colors.white} />}
          />
        </View>

        <View style={{ height: 32 }} />
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: fontSize.md,
    color: colors.text,
    marginLeft: spacing.md,
  },
  settingValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  aboutTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  aboutText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  versionLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  versionValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  logoutContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
});
