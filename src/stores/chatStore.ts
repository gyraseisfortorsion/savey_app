import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { MessageResponse, SseChunk, HitlData } from '@/src/types/message';
import { UserBalance } from '@/src/types/transaction';
import { getMessages } from '@/src/api/messageApi';
import { uploadFile } from '@/src/api/fileApi';
import { streamChat } from '@/src/lib/api/sse';
import { useBalanceStore } from './balanceStore';
import { MESSAGE_PAGE_SIZE } from '@/src/constants/api';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  isStreaming?: boolean;
  hitlData?: HitlData;
  balance?: UserBalance;
  error?: string;
  hadAttachment?: boolean;
  createdAt: string;
}

export interface PendingFile {
  fileId: string;
  filename: string;
  uri: string;
}

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoadingHistory: boolean;
  hasMore: boolean;
  pendingFiles: PendingFile[];
  abortController: AbortController | null;

  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  addPendingFile: (file: PendingFile) => void;
  removePendingFile: (fileId: string) => void;
  cancelStream: () => void;
  reset: () => void;
}

function apiMessageToChatMessage(m: MessageResponse): ChatMessage {
  return {
    id: m.id,
    content: m.content,
    isUser: m.is_user,
    hitlData: m.hitl_data as HitlData | undefined,
    balance: m.balance,
    error: m.error,
    hadAttachment: m.had_attachment,
    createdAt: m.created_at,
  };
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  isLoadingHistory: false,
  hasMore: true,
  pendingFiles: [],
  abortController: null,

  loadInitial: async () => {
    if (get().isLoadingHistory) return;
    set({ isLoadingHistory: true });
    try {
      const items = await getMessages({ skip: 0, limit: MESSAGE_PAGE_SIZE });
      // API returns messages in ascending order (oldest→newest) — no reverse needed
      const msgs = items.map(apiMessageToChatMessage);
      set({ messages: msgs, hasMore: items.length === MESSAGE_PAGE_SIZE, isLoadingHistory: false });
    } catch {
      set({ isLoadingHistory: false });
    }
  },

  loadMore: async () => {
    const { messages, isLoadingHistory, hasMore } = get();
    if (isLoadingHistory || !hasMore) return;
    set({ isLoadingHistory: true });
    try {
      const items = await getMessages({ skip: messages.length, limit: MESSAGE_PAGE_SIZE });
      // API returns ascending order — prepend directly
      const older = items.map(apiMessageToChatMessage);
      set({
        messages: [...older, ...messages],
        hasMore: items.length === MESSAGE_PAGE_SIZE,
        isLoadingHistory: false,
      });
    } catch {
      set({ isLoadingHistory: false });
    }
  },

  sendMessage: async (text) => {
    const { pendingFiles } = get();
    const fileIds = pendingFiles.map((f) => f.fileId);

    // Optimistic user message
    const userMsg: ChatMessage = {
      id: uuidv4(),
      content: text,
      isUser: true,
      hadAttachment: fileIds.length > 0,
      createdAt: new Date().toISOString(),
    };

    // Placeholder AI message that will stream into
    const aiMsgId = uuidv4();
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      content: '',
      isUser: false,
      isStreaming: true,
      createdAt: new Date().toISOString(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg, aiPlaceholder],
      isStreaming: true,
      pendingFiles: [],
    }));

    const controller = new AbortController();
    set({ abortController: controller });

    let accumulated = '';
    let finalBalance: UserBalance | undefined;
    let finalHitlData: HitlData | undefined;

    const updateContent = (content: string) => {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === aiMsgId ? { ...m, content } : m
        ),
      }));
    };

    try {
      await streamChat(
        { message: text, file_ids: fileIds.length > 0 ? fileIds : undefined },
        (chunk: SseChunk) => {
          if (chunk.content) {
            accumulated += chunk.content;
            updateContent(accumulated);
          }
          if (chunk.balance) {
            finalBalance = chunk.balance;
            useBalanceStore.getState().setBalance(chunk.balance);
          }
          if (chunk.hitl_data) {
            finalHitlData = chunk.hitl_data as HitlData;
          }
        },
        controller.signal
      );

      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: accumulated, isStreaming: false, balance: finalBalance, hitlData: finalHitlData }
            : m
        ),
        isStreaming: false,
        abortController: null,
      }));
    } catch (e: unknown) {
      const isAbort = e instanceof Error && e.name === 'AbortError';
      if (isAbort) {
        set((s) => ({
          messages: s.messages.filter((m) => m.id !== aiMsgId),
          isStreaming: false,
          abortController: null,
        }));
      } else {
        const msg = e instanceof Error ? e.message : 'Stream failed';
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === aiMsgId
              ? { ...m, isStreaming: false, error: msg, content: accumulated || msg }
              : m
          ),
          isStreaming: false,
          abortController: null,
        }));
      }
    }
  },

  addPendingFile: (file) => {
    set((s) => ({ pendingFiles: [...s.pendingFiles, file] }));
  },

  removePendingFile: (fileId) => {
    set((s) => ({ pendingFiles: s.pendingFiles.filter((f) => f.fileId !== fileId) }));
  },

  cancelStream: () => {
    get().abortController?.abort();
    set({ isStreaming: false, abortController: null });
  },

  reset: () => {
    get().abortController?.abort();
    set({ messages: [], isStreaming: false, pendingFiles: [], hasMore: true, abortController: null });
  },
}));
