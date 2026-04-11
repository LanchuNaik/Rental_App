// ============================================
// Screen — reusable wrapper for all screens
// ============================================
// Handles: SafeAreaView + Android status bar padding + default background.
// Every screen in Rentr should use this as its root container.
//
// Usage:
//   <Screen>
//     <YourContent />
//   </Screen>
//
//   <Screen backgroundColor={colors.primary}>  ← override color
//     ...
//   </Screen>
// ============================================

import {
  SafeAreaView,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/theme';

export default function Screen({ children, backgroundColor, style }) {
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: backgroundColor || colors.background },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Android: push content below the status bar (WiFi/battery area)
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
