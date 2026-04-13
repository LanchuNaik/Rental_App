// ============================================
// AddListingScreen — Multi-step listing wizard
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const STEPS = ['Photos', 'Details', 'Price', 'Location', 'Availability'];

const STEP_ICONS = [
  'images-outline',
  'document-text-outline',
  'pricetag-outline',
  'location-outline',
  'calendar-outline',
];

// Step placeholder data
const STEP_CONTENT = {
  1: null, // Photos — fully built below
  2: {
    title: 'Item Details',
    subtitle: 'Describe your item so renters know exactly what they are getting.',
    fields: ['Item Title', 'Category', 'Condition', 'Description'],
  },
  3: {
    title: 'Set Your Price',
    subtitle: 'Set a competitive daily rate. You can also offer weekly discounts.',
    fields: ['Daily Rate ($)', 'Weekly Discount (%)', 'Security Deposit ($)'],
  },
  4: {
    title: 'Pickup Location',
    subtitle: "Enter the address where renters will pick up the item. Your exact address is only shown after booking.",
    fields: ['Street Address', 'City', 'State / Province', 'ZIP / Postal Code'],
  },
  5: {
    title: 'Availability',
    subtitle: 'Set your availability windows and any blackout dates.',
    fields: ['Available From', 'Available To', 'Blackout Dates'],
  },
};

function ProgressBar({ currentStep, totalSteps }) {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <View key={stepNum} style={styles.progressStepWrapper}>
            <View
              style={[
                styles.progressSegment,
                isDone && styles.progressSegmentDone,
                isActive && styles.progressSegmentActive,
              ]}
            />
            <View
              style={[
                styles.progressDot,
                isDone && styles.progressDotDone,
                isActive && styles.progressDotActive,
              ]}
            >
              {isDone ? (
                <Ionicons name="checkmark" size={10} color={colors.textInverse} />
              ) : (
                <Text style={[styles.progressDotText, isActive && styles.progressDotTextActive]}>
                  {stepNum}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.progressLabel,
                isActive && styles.progressLabelActive,
                isDone && styles.progressLabelDone,
              ]}
              numberOfLines={1}
            >
              {STEPS[idx]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function PhotosStep() {
  const [photos, setPhotos] = useState(Array(6).fill(null));

  const handleAddPhoto = (idx) => {
    const newPhotos = [...photos];
    const placeholders = ['#BFDBFE', '#BBF7D0', '#FDE68A', '#DDD6FE', '#FBCFE8', '#CFFAFE'];
    newPhotos[idx] = { color: placeholders[idx] };
    setPhotos(newPhotos);
  };

  return (
    <View style={styles.photosStep}>
      <Text style={styles.stepSubtitle}>
        Add up to 6 photos. The first photo will be your cover image.
      </Text>

      {/* Photo Grid */}
      <View style={styles.photoGrid}>
        {photos.map((photo, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.photoBox, photo && { backgroundColor: photo.color }]}
            onPress={() => handleAddPhoto(idx)}
            activeOpacity={0.8}
          >
            {photo ? (
              <>
                <Ionicons name="image" size={28} color={colors.textSecondary} />
                {idx === 0 && (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>Cover</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Ionicons name="add" size={28} color={colors.textMuted} />
                {idx === 0 && (
                  <Text style={styles.addPhotoLabel}>Cover photo</Text>
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tips */}
      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>Photo Tips</Text>
        <Text style={styles.tipsBody}>
          Use natural lighting, show all sides, and include any accessories. High-quality photos get 60% more bookings.
        </Text>
      </View>
    </View>
  );
}

function PlaceholderStep({ stepData }) {
  return (
    <View style={styles.placeholderStep}>
      <Text style={styles.placeholderTitle}>{stepData.title}</Text>
      <Text style={styles.stepSubtitle}>{stepData.subtitle}</Text>
      {stepData.fields.map((field) => (
        <View key={field} style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{field}</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${field.toLowerCase()}`}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      ))}
    </View>
  );
}

export default function AddListingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
    } else {
      navigation.navigate('MyListings');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name={currentStep === 1 ? 'close' : 'chevron-back'} size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Listing</Text>
        <Text style={styles.stepCounter}>{currentStep}/{STEPS.length}</Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />

      {/* Step Header */}
      <View style={styles.stepHeader}>
        <View style={styles.stepIconWrapper}>
          <Ionicons name={STEP_ICONS[currentStep - 1]} size={24} color={colors.primary} />
        </View>
        <Text style={styles.stepTitle}>{STEPS[currentStep - 1]}</Text>
      </View>

      {/* Step Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currentStep === 1 ? (
          <PhotosStep />
        ) : (
          <PlaceholderStep stepData={STEP_CONTENT[currentStep]} />
        )}
        <View style={{ height: spacing.xxxl + spacing.xl }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {currentStep === STEPS.length ? 'Publish Listing' : 'Next'}
          </Text>
          <Ionicons
            name={currentStep === STEPS.length ? 'checkmark' : 'arrow-forward'}
            size={20}
            color={colors.textInverse}
          />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  stepCounter: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  // Progress Bar
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressStepWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  progressSegment: {
    position: 'absolute',
    top: 11,
    left: '50%',
    right: -100,
    height: 2,
    backgroundColor: colors.border,
    zIndex: 0,
  },
  progressSegmentDone: {
    backgroundColor: colors.success,
  },
  progressSegmentActive: {
    backgroundColor: colors.primaryLight,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressDotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressDotText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
  progressDotTextActive: {
    color: colors.textInverse,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  progressLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  progressLabelDone: {
    color: colors.success,
  },
  // Step Header
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primaryLight,
  },
  stepIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  stepTitle: {
    ...typography.h3,
    color: colors.primary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  // Photos Step
  photosStep: {
    gap: spacing.lg,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  photoBox: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    position: 'relative',
    gap: 4,
  },
  coverBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  coverBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textInverse,
    fontSize: 10,
  },
  addPhotoLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  tipsBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  tipsTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  tipsBody: {
    ...typography.bodySmall,
    color: colors.primary,
    lineHeight: 20,
  },
  // Placeholder Step
  placeholderStep: {
    gap: spacing.lg,
  },
  placeholderTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  nextBtnText: {
    ...typography.button,
    color: colors.textInverse,
  },
});
