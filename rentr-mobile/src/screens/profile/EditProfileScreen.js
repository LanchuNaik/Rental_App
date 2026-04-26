import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import {
  getProfileApi,
  updateProfileApi,
  updateAvatarApi,
  deleteAvatarApi,
} from '../../services/user.service';
import { imageUrl } from '../../utils/imageUrl';

export default function EditProfileScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [bio,      setBio]      = useState('');
  const [phone,    setPhone]    = useState('');
  const [email,    setEmail]    = useState('');
  const [avatar,   setAvatar]   = useState(null); // local uri or server path

  const [focusedField,  setFocusedField]  = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfileApi();
        const u = res.data;
        setFullName(u.name  || '');
        setBio(u.bio        || '');
        setPhone(u.phone    || '');
        setEmail(u.email    || '');
        if (u.avatar) {
          setAvatar(imageUrl(u.avatar));
        }
      } catch (err) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAvatarPress = () => {
    const options = ['Choose from Library', 'Remove Photo', 'Cancel'];
    Alert.alert('Profile Photo', 'What would you like to do?', [
      {
        text: 'Choose from Library',
        onPress: pickAvatar,
      },
      {
        text: 'Remove Photo',
        style: 'destructive',
        onPress: removeAvatar,
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setAvatarLoading(true);
    try {
      const res = await updateAvatarApi(uri);
      const updatedPath = res.data?.avatar;
      setAvatar(updatedPath ? imageUrl(updatedPath) : uri);
      Alert.alert('Done', 'Profile photo updated.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not upload photo.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const removeAvatar = async () => {
    if (!avatar) return;
    setAvatarLoading(true);
    try {
      await deleteAvatarApi();
      setAvatar(null);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not remove photo.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Full name is required.');
      return;
    }
    setSaving(true);
    try {
      await updateProfileApi({ name: fullName.trim(), bio, phone });
      Alert.alert('Profile Updated', 'Your profile has been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (field) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  const initials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveHeaderBtn, saving && styles.saveHeaderBtnDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Avatar Edit */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress} activeOpacity={0.8}>
            {avatarLoading ? (
              <View style={[styles.avatar, styles.avatarLoading]}>
                <ActivityIndicator color={colors.textInverse} />
              </View>
            ) : avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarEditOverlay}>
              <Ionicons name="camera" size={18} color={colors.textInverse} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={inputStyle('name')}
              value={fullName}
              onChangeText={setFullName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Bio */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[inputStyle('bio'), styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              onFocus={() => setFocusedField('bio')}
              onBlur={() => setFocusedField(null)}
              placeholder="Tell renters a little about yourself..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={styles.bioCount}>{bio.length}/300</Text>
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.phoneInputWrapper}>
              <View style={[styles.phonePrefix, focusedField === 'phone' && styles.phonePrefixFocused]}>
                <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
              </View>
              <TextInput
                style={[inputStyle('phone'), styles.phoneInput]}
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </View>
            <Text style={styles.fieldHint}>Used for booking notifications only. Not publicly displayed.</Text>
          </View>

          {/* Email — read only */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{email}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <Text style={styles.fieldHint}>Email address cannot be changed here.</Text>
          </View>
        </View>

        {/* Verification Section */}
        <View style={styles.verificationCard}>
          <Text style={styles.verificationTitle}>Identity Verification</Text>
          <Text style={styles.verificationBody}>
            Verify your identity to build trust with renters and owners. Verified profiles get 3x more bookings.
          </Text>
          <TouchableOpacity style={styles.verifyBtn}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={styles.verifyBtnText}>Verify Identity</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnLoading]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <Text style={styles.saveBtnText}>Saving...</Text>
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color={colors.textInverse} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  saveHeaderBtn: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  saveHeaderBtnDisabled: {
    color: colors.textMuted,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  avatarLoading: {
    backgroundColor: colors.primary,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    ...shadows.medium,
  },
  avatarInitials: {
    ...typography.h2,
    color: colors.textInverse,
    fontWeight: '700',
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  formSection: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.small,
    gap: spacing.lg,
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
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  bioCount: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: -spacing.sm,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
  },
  phonePrefix: {
    width: 48,
    borderWidth: 1.5,
    borderRightWidth: 0,
    borderColor: colors.border,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phonePrefixFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  inputDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    opacity: 0.7,
  },
  inputDisabledText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.success,
  },
  fieldHint: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
  verificationCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  verificationTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  verificationBody: {
    ...typography.bodySmall,
    color: colors.primary,
    lineHeight: 20,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  verifyBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  saveBtnLoading: {
    backgroundColor: colors.primaryDark,
  },
  saveBtnText: {
    ...typography.button,
    color: colors.textInverse,
  },
});
