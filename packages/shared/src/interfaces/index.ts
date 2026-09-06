import { UserRole, OrderStatus, PaymentStatus } from '../enums';

export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
    [key: string]: any;
  };
  timestamp: string;
  traceId?: string;
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface IUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IProductSummary {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  category?: {
    id: string;
    name: string;
  };
  isActive: boolean;
}
