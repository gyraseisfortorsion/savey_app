import { apiClient } from '@/src/lib/api/axios';
import { FileUploadResponse } from '@/src/types/file';

export async function uploadFile(uri: string, filename: string, mimeType: string): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const res = await apiClient.post<FileUploadResponse>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
