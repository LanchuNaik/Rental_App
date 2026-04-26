// ============================================
// ChatScreen — Real-time chat scoped to a booking
// ============================================
// Flow on mount:
//   1. Read my user id from AsyncStorage (so we know which side of the bubble)
//   2. Fetch chat history via REST (/api/chat/:bookingId)
//   3. Connect to Socket.io, join the booking's room
//   4. Listen for "newMessage" events → append to the list
// On unmount: leave the room and remove our listener (don't kill the socket
// itself — other screens may use it).

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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { colors, spacing, typography, radius, shadows } from '../../theme/theme';
import { getMessagesApi } from '../../services/chat.service';
import { connectSocket } from '../../services/socket';
import { getUser } from '../../services/storage.service';
import { getProfileApi } from '../../services/user.service';

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function formatTime(dateInput) {
  if (!dateInput) return '';
  return new Date(dateInput).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

function MessageBubble({ message, myId }) {
  const senderId   = message.sender?._id || message.sender;
  const isMe       = senderId?.toString() === myId?.toString();
  const senderName = message.sender?.name || 'User';

  return (
    <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
      <View style={[styles.senderAvatar, isMe && styles.senderAvatarMe]}>
        <Text style={[styles.senderAvatarText, isMe && styles.senderAvatarTextMe]}>
          {getInitials(senderName)}
        </Text>
      </View>
      <View style={styles.messageContent}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
            {message.text}
          </Text>
        </View>
        <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen({ navigation, route }) {
  const { bookingId, partnerName } = route?.params || {};

  const [messages,  setMessages]  = useState([]);
  const [inputText, setInputText] = useState('');
  const [myId,      setMyId]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);

  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Who am I? Try AsyncStorage first; fall back to fetching profile
        // (profile is the source of truth — works even if local cache is stale)
        let userId = null;
        const cached = await getUser();
        userId = cached?.id || cached?._id || null;

        if (!userId) {
          try {
            const profileRes = await getProfileApi();
            userId = profileRes.data?._id || profileRes.data?.id || null;
          } catch {
            // ignore — myId stays null
          }
        }
        if (!cancelled) setMyId(userId);

        // 2. Load history
        const res = await getMessagesApi(bookingId);
        if (!cancelled) setMessages(res.data || []);

        // 3. Connect to Socket.io and join this booking's room
        const socket = await connectSocket();
        socketRef.current = socket;

        socket.emit('joinRoom', { bookingId }, (ack) => {
          if (!ack?.ok) {
            Alert.alert('Chat error', ack?.error || 'Could not join chat');
          }
        });

        // 4. Listen for incoming messages (from anyone in this room — including our own echoes)
        const onNewMessage = (msg) => {
          if (cancelled) return;
          setMessages((prev) => {
            // De-dupe: if the message is already in the list (by _id), ignore
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        };
        socket.on('newMessage', onNewMessage);

        // Cleanup function — runs on unmount
        return () => {
          socket.off('newMessage', onNewMessage);
          socket.emit('leaveRoom', { bookingId });
        };
      } catch (err) {
        if (!cancelled) Alert.alert('Error', err.message || 'Could not load chat');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    let cleanup;
    init().then((fn) => { cleanup = fn; });

    return () => {
      cancelled = true;
      if (typeof cleanup === 'function') cleanup();
    };
  }, [bookingId]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || sending) return;
    if (!socketRef.current) return;

    setSending(true);
    socketRef.current.emit('sendMessage', { bookingId, text }, (ack) => {
      setSending(false);
      if (!ack?.ok) {
        Alert.alert('Send failed', ack?.error || 'Could not send message');
        return;
      }
      // Successfully sent — server will broadcast newMessage which appends to list.
      // Just clear the input.
      setInputText('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
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
            <Text style={styles.headerAvatarText}>{getInitials(partnerName || 'Chat')}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{partnerName || 'Chat'}</Text>
            <Text style={styles.headerStatus}>Live</Text>
          </View>
        </View>
      </View>

      {/* Booking context */}
      <View style={styles.contextBanner}>
        <Ionicons name="cube-outline" size={14} color={colors.primary} />
        <Text style={styles.contextText} numberOfLines={1}>Booking chat</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BookingDetail', { bookingId })}>
          <Text style={styles.contextLink}>View</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {loading ? (
            <View style={{ paddingTop: spacing.xxl, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : messages.length === 0 ? (
            <Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: spacing.xxl }}>
              No messages yet — start the conversation.
            </Text>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg._id} message={msg} myId={myId} />
            ))
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim() && !sending && styles.sendBtnActive]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.8}
          >
            {sending
              ? <ActivityIndicator size="small" color={colors.textInverse} />
              : <Ionicons name="send" size={18} color={inputText.trim() ? colors.textInverse : colors.textMuted} />}
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
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  headerAvatar: {
    width: 38, height: 38, borderRadius: radius.full,
    backgroundColor: '#DDD6FE', alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { ...typography.bodySmall, fontWeight: '700', color: colors.textPrimary },
  headerName:       { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  headerStatus:     { ...typography.caption, color: colors.success },
  contextBanner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight, gap: spacing.sm,
  },
  contextText: { ...typography.caption, color: colors.primary, flex: 1, fontWeight: '500' },
  contextLink: { ...typography.caption, fontWeight: '700', color: colors.primaryDark },
  messageList: { flex: 1, backgroundColor: colors.surface },
  messageListContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.lg },
  messageRow:  { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  messageRowMe:{ flexDirection: 'row-reverse' },
  senderAvatar: {
    width: 30, height: 30, borderRadius: radius.full,
    backgroundColor: '#DDD6FE', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginBottom: spacing.lg,
  },
  senderAvatarMe: { backgroundColor: colors.primary },
  senderAvatarText: { ...typography.caption, fontWeight: '700', color: colors.textPrimary },
  senderAvatarTextMe: { color: colors.textInverse },
  messageContent:   { maxWidth: '75%', gap: 4 },
  bubble: { borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  bubbleThem: { backgroundColor: colors.background, borderBottomLeftRadius: radius.sm, ...shadows.small },
  bubbleMe:   { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm },
  bubbleText:   { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  bubbleTextMe: { color: colors.textInverse },
  timestamp:    { ...typography.caption, color: colors.textMuted, marginLeft: spacing.xs },
  timestampMe:  { textAlign: 'right', marginRight: spacing.xs },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm,
    backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
  },
  textInput: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    ...typography.body, color: colors.textPrimary, maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: colors.primary },
});
