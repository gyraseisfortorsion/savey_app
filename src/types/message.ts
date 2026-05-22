import { UserBalance } from './transaction';

export interface HitlData {
  action: string;
  payload: Record<string, unknown>;
  description?: string;
}

export interface MessageResponse {
  id: string;
  user_id: string;
  content: string;
  is_user: boolean;
  had_attachment: boolean;
  hitl_data?: HitlData;
  balance?: UserBalance;
  error?: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  file_ids?: string[];
}

export interface SseChunk {
  content?: string;
  hitl_data?: HitlData;
  balance?: UserBalance;
  error?: string;
}

export interface MessageListResponse {
  items: MessageResponse[];
  total: number;
  page: number;
  size: number;
}
