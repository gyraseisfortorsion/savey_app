import React, { useEffect } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useChatStore } from '@/src/stores/chatStore';
import { ChatBubble } from '@/src/features/chat/ChatBubble';
import { ChatInputBar } from '@/src/features/chat/ChatInputBar';
import { EmptyState } from '@/src/shared/EmptyState';

export default function ChatScreen() {
  console.log('[ChatScreen] render — full chat screen mounted');
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { messages, isLoadingHistory, loadInitial, cancelStream } = useChatStore();
  useEffect(() => {
    loadInitial();
    return () => { cancelStream(); };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Native-blur header */}
      <BlurView
        intensity={80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.headerBlur, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.surfaceVariant }]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Avatar + title */}
          <View style={styles.headerCenter}>
            <View style={styles.headerAvatar}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Money AI</Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                Your financial assistant
              </Text>
            </View>
          </View>

          {/* Spacer to balance the back button */}
          <View style={styles.backBtn} />
        </View>
      </BlurView>

      {/* Message list */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          data={[...messages].reverse()}
          inverted
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={[styles.list, messages.length === 0 && styles.emptyList]}
          ListEmptyComponent={
            isLoadingHistory ? null : (
              <EmptyState
                title="Start a conversation"
                subtitle='Say "I spent 5000 on groceries" to log a transaction'
                icon="🤖"
              />
            )
          }
          onEndReached={() => useChatStore.getState().loadMore()}
          onEndReachedThreshold={0.2}
          showsVerticalScrollIndicator={false}
        />
        <ChatInputBar />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  safeArea: { width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { gap: 2 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerSub: { fontSize: 12 },
  list: { paddingTop: 16, paddingBottom: 110 },
  emptyList: { flex: 1 },
});
