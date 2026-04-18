// ============================================
// Login Screen
// ============================================

import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { loginApi } from '../../services/auth.service';
import { saveSession } from '../../services/storage.service';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleLogin = async () => {
    if (!email || !password)   return Alert.alert('Missing fields', 'Please enter both email and password.');
    if (!isValidEmail(email))  return Alert.alert('Invalid email', 'Please enter a valid email address.');
    if (password.length < 6)   return Alert.alert('Password too short', 'Password must be at least 6 characters.');

    setLoading(true);
    try {
      const res = await loginApi(email, password);
      // Save token + user to device storage
      await saveSession(res.data.token, res.data.user);
      // Tell App.js we're logged in → switches to MainTabs
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      Alert.alert('Login failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="cube" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue renting</Text>
          </View>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
            <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? colors.primary : colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input} placeholder="you@example.com" placeholderTextColor={colors.textMuted}
              value={email} onChangeText={setEmail}
              onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, styles.labelSpaced]}>Password</Text>
          <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? colors.primary : colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input} placeholder="Enter your password" placeholderTextColor={colors.textMuted}
              value={password} onChangeText={setPassword}
              onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Forgot */}
          <TouchableOpacity style={styles.forgotWrapper} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In button */}
          <TouchableOpacity style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
              <Ionicons name="logo-google" size={22} color="#EA4335" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
              <Ionicons name="logo-apple" size={22} color={colors.textPrimary} />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  header:        { marginTop: spacing.xxl, marginBottom: spacing.xxl },
  logoBadge:     { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title:         { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle:      { ...typography.body, color: colors.textSecondary },
  label:         { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
  labelSpaced:   { marginTop: spacing.lg },
  inputWrapper:  { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.lg, height: 56 },
  inputWrapperFocused: { borderColor: colors.primary, backgroundColor: colors.background },
  inputIcon:     { marginRight: spacing.md },
  input:         { flex: 1, ...typography.body, color: colors.textPrimary, height: '100%' },
  forgotWrapper: { alignSelf: 'flex-end', marginTop: spacing.md, marginBottom: spacing.xl, padding: spacing.xs },
  forgotText:    { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  primaryButton: { backgroundColor: colors.primary, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', ...shadows.medium },
  buttonDisabled:{ opacity: 0.7 },
  primaryButtonText: { ...typography.button, color: colors.textInverse },
  divider:       { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  dividerLine:   { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText:   { ...typography.caption, color: colors.textMuted, marginHorizontal: spacing.md },
  socialRow:     { flexDirection: 'row', gap: spacing.md },
  socialButton:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background, gap: spacing.sm },
  socialText:    { ...typography.button, color: colors.textPrimary },
  footer:        { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
  footerText:    { ...typography.body, color: colors.textSecondary },
  footerLink:    { ...typography.body, color: colors.primary, fontWeight: '700' },
});
