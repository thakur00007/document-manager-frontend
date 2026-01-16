export interface ApiResponse<T> {
  status: number;
  message: string;
  code?: string;
  data: T;
  success: boolean;

  // Optional fields for error responses
  errors?: string[];
  name?: string;
}
