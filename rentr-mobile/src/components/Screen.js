import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';

export default function Screen({ children, backgroundColor, style }) {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
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
  container: { flex: 1 },
});
