import { apiClient } from '@/src/lib/api/axios';
import { CategoryResponse } from '@/src/types/category';

export async function getCategories(): Promise<CategoryResponse[]> {
  const res = await apiClient.get<CategoryResponse[]>('/categories');
  return res.data;
}
