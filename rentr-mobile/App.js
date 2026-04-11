import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SplashScreen        from './src/screens/auth/SplashScreen';
import WelcomeScreen       from './src/screens/auth/WelcomeScreen';
import LoginScreen         from './src/screens/auth/LoginScreen';
import RegisterScreen      from './src/screens/auth/RegisterScreen';
import RolePickerScreen    from './src/screens/auth/RolePickerScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import { colors, typography } from './src/theme/theme';

// ─────────────────────────────────────────────────────────────────────────────
// Auth flow:
//   splash → welcome → login ──────────────→ home (placeholder)
//                          ↓                ↑
//                       register → rolePicker
//                          ↓
//                    forgotPassword → resetPassword → login
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('splash');

  const go = (name) => setScreen(name);

  if (screen === 'splash')         return <SplashScreen           onFinish={() => go('welcome')} />;
  if (screen === 'welcome')        return <WelcomeScreen          onFinish={() => go('login')} />;
  if (screen === 'login')          return <LoginScreen            onLogin={() => go('home')}         onGoToRegister={() => go('register')} onForgotPassword={() => go('forgot')} />;
  if (screen === 'register')       return <RegisterScreen         onRegister={() => go('rolePicker')} onGoToLogin={() => go('login')} />;
  if (screen === 'rolePicker')     return <RolePickerScreen       onRoleSelected={() => go('home')} />;
  if (screen === 'forgot')         return <ForgotPasswordScreen   onBack={() => go('login')}         onEmailSent={() => go('reset')} />;
  if (screen === 'reset')          return <ResetPasswordScreen    onBack={() => go('forgot')}        onSuccess={() => go('login')} />;

  // ── Placeholder: all auth done, main app next ─────────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Auth complete!</Text>
      <Text style={styles.subtitle}>Next: Main app with bottom tabs</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
