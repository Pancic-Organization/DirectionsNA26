import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appConfig } from '../config/appConfig';
import FormInput from '../components/FormInput';
import ActionButton from '../components/ActionButton';
import { colors, fontSize, fontWeight, spacing } from '../theme';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (
      username === appConfig.app.demoCredentials.username &&
      password === appConfig.app.demoCredentials.password
    ) {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem(
        'userProfile',
        JSON.stringify({
          username,
          displayName: 'Rishabh Shukla',
          isLoggedIn: true,
        })
      );
      setLoading(false);
      onLogin();
    } else {
      setLoading(false);
      setError('Invalid credentials. Use demo: rishabh.shukla / 1234');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>📦</Text>
          </View>
          <Text style={styles.appName}>{appConfig.app.displayName}</Text>
          <Text style={styles.subtitle}>Purchase Order Management</Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
          />
          <FormInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ActionButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: spacing.lg }}
          />
        </View>

        <Text style={styles.hint}>
          Demo: rishabh.shukla / 1234
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    width: '100%',
  },
  error: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  hint: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    marginTop: spacing.xxl,
  },
});
