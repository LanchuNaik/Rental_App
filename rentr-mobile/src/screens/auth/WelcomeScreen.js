// ============================================
// Welcome Screen (Intro Carousel)
// ============================================

import { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  { id: 1, icon: 'location',         title: 'Discover Nearby',  description: 'Find items to rent from people around you on a live map. Thousands of things, just minutes away.', color: colors.primary },
  { id: 2, icon: 'wallet',           title: 'Rent & Earn',      description: 'Make money by renting out stuff you own but rarely use. Turn your garage into passive income.',    color: colors.accent  },
  { id: 3, icon: 'shield-checkmark', title: 'Safe & Secure',    description: 'Protected payments, verified users, and condition photos on every rental. Rent with confidence.',   color: colors.success },
];

export default function WelcomeScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * (currentIndex + 1), animated: true });
    } else {
      navigation.navigate('Login');
    }
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {!isLastSlide && (
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={handleScroll} scrollEventThrottle={16} style={styles.scrollView}>
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={[styles.iconCircle, { backgroundColor: slide.color + '15' }]}>
              <Ionicons name={slide.icon} size={80} color={slide.color} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View key={index} style={[styles.dot, currentIndex === index && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{isLastSlide ? 'Get Started' : 'Next'}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.textInverse} style={{ marginLeft: spacing.sm }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  header:      { height: 60, flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.xl, paddingTop: spacing.md, alignItems: 'center' },
  skipButton:  { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  skipText:    { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
  scrollView:  { flex: 1 },
  slide:       { width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  iconCircle:  { width: 180, height: 180, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxxl },
  title:       { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.lg },
  description: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: spacing.md },
  footer:      { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  dot:         { width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.border },
  dotActive:   { backgroundColor: colors.primary, width: 28 },
  button:      { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, borderRadius: radius.lg, ...shadows.medium },
  buttonText:  { ...typography.button, color: colors.textInverse },
});
