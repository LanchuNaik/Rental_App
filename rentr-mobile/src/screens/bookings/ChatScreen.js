// ============================================
// ChatScreen — Real-time chat scoped to a booking
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';

const MY_ID = 'me';

const INITIAL_MESSAGES = [
  {
    id: 'm1',
    senderId: 'owner',
    senderName: 'Alex Rivera',
    text: 'Hi! Just confirming your pickup is scheduled for April 15th at 10am. Does that still work for you?',
    timestamp: '9:45 AM',
  },
  {
    id: 'm2',
    senderId: MY_ID,
    senderName: 'Me',
    text: "Yes, that works perfectly! I'll be there right at 10.",
    timestamp: '9:48 AM',
  },
  {
    id: 'm3',
    senderId: 'owner',
    senderName: 'Alex Rivera',
    text: "Great! I'll meet you out front. The camera bag and extra batteries are included — just remind me to hand those over.",
    timestamp: '9:50 AM',
  },
  {
    id: 'm4',
    senderId: MY_ID,
    senderName: 'Me',
    text: 'Awesome, thanks! Quick question — does the kit include a 50mm lens or just the kit lens?',
    timestamp: '9:52 AM',
  },
  {
    id: 'm5',
    senderId: 'owner',
    senderName: 'Alex Rivera',
    text: 'It comes with the 28-70mm kit lens. I can bring the 50mm f/1.8 as well if you need it — just let me know!',
    timestamp: '9:53 AM',
  },
];

function TypingIndicator({ visible }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  if (!visible) return null;

  return (
    <View style={styles.typingWrapper}>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, idx) => (
          <Animated.View
            key={idx}
            style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
      <Text style={styles.typingLabel}>Alex is typing...</Text>
    </View>
  );
}

function MessageBubble({ message }) {
  const isMe = message.senderId === MY_ID;
  return (
    <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
      {!isMe && (
        <View style={styles.senderAvatar}>
          <Text style={styles.senderAvatarText}>AR</Text>
        </View>
      )}
      <View style={styles.messageContent}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
            {message.text}
          </Text>
        </View>
        <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Simulate typing indicator going away after 3s
    const timer = setTimeout(() => setIsTyping(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    const newMsg = {
      id: `m${Date.now()}`,
      senderId: MY_ID,
      senderName: 'Me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate reply typing
    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `reply${Date.now()}`,
          senderId: 'owner',
          senderName: 'Alex Rivera',
          text: "Got it! I'll sort that out for you.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 3000);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>AR</Text>
          </View>
          <View>
            <Text style={styles.headerName}>Alex Rivera</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callBtn}>
          <Ionicons name="call-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Booking Context Banner */}
      <View style={styles.contextBanner}>
        <Ionicons name="cube-outline" size={14} color={colors.primary} />
        <Text style={styles.contextText} numberOfLines={1}>
          Sony A7 III Camera  •  Apr 15 – Apr 18, 2026
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('BookingDetail', { bookingId: 'b1' })}>
          <Text style={styles.contextLink}>View</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Date Divider */}
          <View style={styles.dateDivider}>
            <View style={styles.dateLine} />
            <Text style={styles.dateLabel}>Today</Text>
            <View style={styles.dateLine} />
          </View>

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          <TypingIndicator visible={isTyping} />
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="attach" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim() && styles.sendBtnActive]}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? colors.textInverse : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    gap: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerStatus: {
    ...typography.caption,
    color: colors.success,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    gap: spacing.sm,
  },
  contextText: {
    ...typography.caption,
    color: colors.primary,
    flex: 1,
    fontWeight: '500',
  },
  contextLink: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  messageList: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  messageListContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  messageRowMe: {
    flexDirection: 'row-reverse',
  },
  senderAvatar: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: spacing.lg,
  },
  senderAvatarText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  messageContent: {
    maxWidth: '75%',
    gap: 4,
  },
  bubble: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bubbleThem: {
    backgroundColor: colors.background,
    borderBottomLeftRadius: radius.sm,
    ...shadows.small,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.sm,
  },
  bubbleText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bubbleTextMe: {
    color: colors.textInverse,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  timestampMe: {
    textAlign: 'right',
    marginRight: spacing.xs,
  },
  typingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.sm,
    ...shadows.small,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.textMuted,
  },
  typingLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
  },
});
