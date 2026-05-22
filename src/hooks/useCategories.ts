import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/src/api/categoryApi';

export const CATEGORIES_KEY = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
