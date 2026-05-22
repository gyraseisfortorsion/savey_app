export interface UserResponse {
  id: string;
  email: string;
  full_name?: string;
  currency: string;
  monthly_limit?: number | null;
  daily_limit?: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  currency?: string;
  password?: string;
  monthly_limit?: number | null;
  daily_limit?: number | null;
}
