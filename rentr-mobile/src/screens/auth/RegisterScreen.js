// ============================================
// Register Screen
// ============================================
// New user sign-up: name, email, password, confirm password, T&C checkbox.
// Shows password strength indicator below the password field.
// ============================================

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

// ── Password strength helper ──────────────────────────────────────────────────
// Returns { score: 0-4, label, color } based on the password value.
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: colors.border };
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Too short',  color: colors.error },
    { label: 'Weak',       color: colors.error },
    { label: 'Fair',       color: colors.warning },
    { label: 'Good',       color: '#84CC16' },
    { label: 'Strong',     color: colors.success },
  ];
  return { score, ...levels[score] };
}

export default function RegisterScreen({ onRegister, onGoToLogin }) {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [agreedToTerms,   setAgreedToTerms]   = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [focusedField,    setFocusedField]    = useState(null);

  const strength = getPasswordStrength(password);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleRegister = async () => {
    if (!name.trim())                       return Alert.alert('Required', 'Please enter your name.');
    if (!isValidEmail(email))               return Alert.alert('Invalid email', 'Please enter a valid email.');
    if (password.length < 6)               return Alert.alert('Weak password', 'Password must be at least 6 characters.');
    if (password !== confirmPassword)       return Alert.alert('Mismatch', 'Passwords do not match.');
    if (!agreedToTerms)                     return Alert.alert('Terms', 'Please agree to the Terms & Conditions.');

    setLoading(true);
    try {
      // TODO: replace with real POST /api/auth/register
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (onRegister) onRegister({ name, email });
    } catch (err) {
      Alert.alert('Registration failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Helper — renders a labelled text input with icon
  const renderInput = ({ field, label, icon, value, onChangeText, placeholder, secure, toggleSecure, showSecure, keyboardType, autoCapitalize }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, focusedField === field && styles.inputWrapperFocused]}>
        <Ionicons
          name={icon}
          size={20}
          color={focusedField === field ? colors.primary : colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          secureTextEntry={secure ? !showSecure : false}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={false}
        />
        {toggleSecure && (
          <TouchableOpacity
            onPress={toggleSecure}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="person-add" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start renting or earning today</Text>
          </View>

          {/* Form fields */}
          {renderInput({
            field: 'name', label: 'Full Name', icon: 'person-outline',
            value: name, onChangeText: setName,
            placeholder: 'John Doe', autoCapitalize: 'words',
          })}

          {renderInput({
            field: 'email', label: 'Email', icon: 'mail-outline',
            value: email, onChangeText: setEmail,
            placeholder: 'you@example.com', keyboardType: 'email-address',
          })}

          {renderInput({
            field: 'password', label: 'Password', icon: 'lock-closed-outline',
            value: password, onChangeText: setPassword,
            placeholder: 'Min. 6 characters', secure: true,
            showSecure: showPassword, toggleSecure: () => setShowPassword(!showPassword),
          })}

          {/* Password strength bar */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      { backgroundColor: i < strength.score ? strength.color : colors.border },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          {renderInput({
            field: 'confirm', label: 'Confirm Password', icon: 'shield-checkmark-outline',
            value: confirmPassword, onChangeText: setConfirmPassword,
            placeholder: 'Re-enter password', secure: true,
            showSecure: showConfirm, toggleSecure: () => setShowConfirm(!showConfirm),
          })}

          {/* T&C checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && (
                <Ionicons name="checkmark" size={14} color={colors.textInverse} />
              )}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text style={styles.checkboxLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.checkboxLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onGoToLogin}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  inputIcon: { marginRight: spacing.md },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    height: '100%',
  },
  // ── Strength bar ──
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  strengthBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
  },
  strengthLabel: {
    ...typography.caption,
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  // ── Checkbox ──
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  checkboxLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  // ── Button ──
  primaryButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: {
    ...typography.button,
    color: colors.textInverse,
  },
  // ── Footer ──
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
});
