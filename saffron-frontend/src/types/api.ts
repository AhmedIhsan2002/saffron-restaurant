// استجابة الخطأ القياسية من Laravel
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}