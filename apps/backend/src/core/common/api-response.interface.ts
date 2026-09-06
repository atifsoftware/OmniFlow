export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
  traceId?: string;
}
