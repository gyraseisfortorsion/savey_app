import { apiClient } from '@/src/lib/api/axios';
import { MessageResponse } from '@/src/types/message';

export async function getMessages(params: { skip?: number; limit?: number } = {}): Promise<MessageResponse[]> {
  const res = await apiClient.get<MessageResponse[]>('/messages', { params });
  return res.data;
}
