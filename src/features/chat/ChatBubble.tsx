import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { ChatMessage } from '@/src/stores/chatStore';
import { TypingIndicator } from './TypingIndicator';
import { BalanceMiniCard } from './BalanceMiniCard';
import { HitlActionCard } from './HitlActionCard';

interface Props {
  message: ChatMessage;
}

export function ChatBubble({ message }: Props) {
  const { colors } = useAppTheme();
  const isUser = message.isUser;

  if (!isUser && message.isStreaming && !message.content) {
    return (
      <View style={[styles.wrapper, styles.aiWrapper]}>
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color="#FFFFFF" />
        </View>
        <TypingIndicator />
      </View>
    );
  }

  const textStyle: TextStyle = { color: colors.text, fontSize: 14, lineHeight: 21 };

  // Append cursor while streaming so the bubble feels live.
  // Removed when isStreaming becomes false — no re-render mode switch.
  const displayContent = !isUser && message.isStreaming
    ? message.content + '▌'
    : message.content;

  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color="#FFFFFF" />
        </View>
      )}

      <View style={styles.bubbleColumn}>
        <View
          style={[
            styles.bubble,
            isUser
              ? styles.userBubble
              : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
          ]}
        >
          {isUser ? (
            <Text style={styles.userText}>{message.content}</Text>
          ) : (
            <Markdown
              style={{
                body: textStyle,
                code_inline: {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.primary,
                  borderRadius: 4,
                  paddingHorizontal: 4,
                },
                fence: { backgroundColor: colors.surfaceVariant, borderRadius: 8 },
              }}
            >
              {displayContent}
            </Markdown>
          )}

          {message.error && !isUser && (
            <Text style={[styles.errorText, { color: colors.error }]}>⚠ {message.error}</Text>
          )}

          {message.balance && !message.isStreaming && <BalanceMiniCard balance={message.balance} />}
        </View>

        {message.hitlData && <HitlActionCard hitlData={message.hitlData} messageId={message.id} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 4, paddingHorizontal: 20, flexDirection: 'row', gap: 10 },
  userWrapper: { justifyContent: 'flex-end' },
  aiWrapper: { justifyContent: 'flex-start', alignItems: 'flex-start' },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  bubbleColumn: { maxWidth: '80%', gap: 8 },
  bubble: { padding: 14 },
  userBubble: {
    backgroundColor: '#1E2432',
    borderRadius: 16,
    borderTopRightRadius: 4,
  },
  aiBubble: {
    borderWidth: 1,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  userText: { color: '#FFFFFF', fontSize: 14, lineHeight: 21 },
  errorText: { marginTop: 8, fontSize: 13, fontStyle: 'italic' },
});
