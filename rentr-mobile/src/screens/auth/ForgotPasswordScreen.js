// ============================================
// Forgot Password Screen
// ============================================

import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { forgotPasswordApi } from '../../api/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [email,        setEmail]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSend = async () => {
    if (!isValidEmail(email)) return;
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      setSubmitted(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Screen>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Ionicons name="mail" size={48} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Check your inbox</Text>
          <Text style={styles.successSubtitle}>
            We sent a reset link to{'\n'}<Text style={styles.successEmail}>{email}</Text>
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resendButton} onPress={() => setSubmitted(false)}>
            <Text style={styles.resendText}>Didn't receive it? Try again</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.iconCircle}>
            <Ionicons name="key" size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>Enter your email and we'll send you a reset link.</Text>

          <Text style={styles.label}>Email address</Text>
          <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
            <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? colors.primary : colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input} placeholder="you@example.com" placeholderTextColor={colors.textMuted}
              value={email} onChangeText={setEmail}
              onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, (!isValidEmail(email) || loading) && styles.buttonDisabled]}
            onPress={handleSend} disabled={!isValidEmail(email) || loading} activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.primaryButtonText}>Send Reset Link</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={16} color={colors.primary} />
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex:            { flex: 1 },
  container:       { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  backButton:      { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  iconCircle:      { width: 72, height: 72, borderRadius: radius.xl, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title:           { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle:        { ...typography.body, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.xl },
  label:           { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
  inputWrapper:    { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.lg, height: 56, marginBottom: spacing.xl },
  inputWrapperFocused: { borderColor: colors.primary, backgroundColor: colors.background },
  inputIcon:       { marginRight: spacing.md },
  input:           { flex: 1, ...typography.body, color: colors.textPrimary, height: '100%' },
  primaryButton:   { backgroundColor: colors.primary, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', ...shadows.medium, marginBottom: spacing.xl },
  buttonDisabled:  { opacity: 0.45 },
  primaryButtonText: { ...typography.button, color: colors.textInverse },
  backToLogin:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  backToLoginText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  successContainer:  { flex: 1, paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  successIconCircle: { width: 100, height: 100, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  successTitle:    { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'center' },
  successSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xxl },
  successEmail:    { color: colors.textPrimary, fontWeight: '700' },
  resendButton:    { marginTop: spacing.lg, padding: spacing.sm },
  resendText:      { ...typography.bodySmall, color: colors.textMuted, textDecorationLine: 'underline' },
});
