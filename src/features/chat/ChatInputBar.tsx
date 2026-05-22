import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useChatStore } from '@/src/stores/chatStore';
import { uploadFile } from '@/src/api/fileApi';

export function ChatInputBar() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const { sendMessage, isStreaming, pendingFiles, addPendingFile, removePendingFile } = useChatStore();

  const handleSend = async () => {
    if (!text.trim() && pendingFiles.length === 0) return;
    const msg = text.trim();
    setText('');
    await sendMessage(msg);
  };

  const handleAttach = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'text/plain', 'text/csv'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const uploaded = await uploadFile(
        asset.uri,
        asset.name,
        asset.mimeType ?? 'application/octet-stream'
      );
      addPendingFile({ fileId: uploaded.file_id, filename: asset.name, uri: asset.uri });
    } catch (e: unknown) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const canSend = (text.trim().length > 0 || pendingFiles.length > 0) && !isStreaming;
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <BlurView
      intensity={80}
      tint={isDark ? 'dark' : 'light'}
      style={[styles.blur, { paddingBottom: bottomPad }]}
    >
      {/* Pending file chips */}
      {pendingFiles.length > 0 && (
        <View style={styles.files}>
          {pendingFiles.map((f) => (
            <View key={f.fileId} style={[styles.fileChip, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.fileName, { color: colors.primary }]} numberOfLines={1}>
                📎 {f.filename}
              </Text>
              <TouchableOpacity onPress={() => removePendingFile(f.fileId)}>
                <Ionicons name="close-circle" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.row}>
        {/* Attachment button — standalone, outside the input pill */}
        <TouchableOpacity
          onPress={handleAttach}
          disabled={isStreaming}
          style={[styles.attachBtn, { backgroundColor: colors.surfaceVariant }]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="attach"
            size={20}
            color={isStreaming ? colors.textTertiary : colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Text input pill */}
        <View style={[styles.inputPill, { backgroundColor: colors.surfaceVariant }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="I bought coffee for 1200..."
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={2000}
            style={[styles.input, { color: colors.text }]}
            editable={!isStreaming}
            returnKeyType="send"
            onSubmitEditing={canSend ? handleSend : undefined}
            blurOnSubmit={false}
          />
        </View>

        {/* Send / stop button */}
        <TouchableOpacity
          onPress={isStreaming ? () => useChatStore.getState().cancelStream() : handleSend}
          disabled={!isStreaming && !canSend}
          style={[
            styles.sendBtn,
            { backgroundColor: isStreaming || canSend ? '#2E7D32' : colors.surfaceVariant },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isStreaming ? 'stop' : 'arrow-up'}
            size={18}
            color={isStreaming || canSend ? '#FFFFFF' : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  files: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    maxWidth: 200,
  },
  fileName: { fontSize: 12, fontWeight: '500', flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inputPill: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    maxHeight: 120,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
