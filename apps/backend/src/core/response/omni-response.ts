/**
 * OmniFlow API Response Formatter
 * Inspired by NodeFlow-React ApiResource.js
 * Provides consistent, standardized API responses across the application.
 */
export class OmniResponse {
  /**
   * Successful response
   */
  static success<T>(data: T, message = "Success", meta?: Record<string, unknown>): OmniSuccessResponse<T> {
    const response: OmniSuccessResponse<T> = {
      success: true,
      message,
      data,
    };
    if (meta) response.meta = meta;
    return response;
  }

  /**
   * Error response
   */
  static error(
    message: string,
    errors?: Record<string, unknown>,
    code?: string,
  ): OmniErrorResponse {
    const response: OmniErrorResponse = {
      success: false,
      message,
    };
    if (errors) response.errors = errors;
    if (code) response.code = code;
    return response;
  }

  /**
   * Paginated list response
   */
  static paginate<T>(
    data: T[],
    total: number,
    page: number,
    perPage: number,
    message = "Success",
  ): OmniPaginatedResponse<T> {
    const totalPages = Math.ceil(total / perPage) || 1;
    const currentPage = parseInt(String(page)) || 1;

    return {
      success: true,
      message,
      data,
      pagination: {
        total,
        per_page: perPage,
        current_page: currentPage,
        total_pages: totalPages,
        from: (currentPage - 1) * perPage + 1,
        to: Math.min(currentPage * perPage, total),
        has_more: currentPage < totalPages,
        has_previous: currentPage > 1,
      },
    };
  }

  /**
   * Created response (201)
   */
  static created<T>(data: T, message = "Resource created successfully."): OmniSuccessResponse<T> {
    return this.success(data, message);
  }

  /**
   * No content response
   */
  static noContent(message = "Operation completed."): OmniSuccessResponse<null> {
    return this.success(null, message);
  }

  /**
   * Not found response
   */
  static notFound(resource = "Resource"): OmniErrorResponse {
    return this.error(resource + " not found.", undefined, "NOT_FOUND");
  }

  /**
   * Unauthorized response
   */
  static unauthorized(message = "Unauthenticated. Please login."): OmniErrorResponse {
    return this.error(message, undefined, "UNAUTHORIZED");
  }

  /**
   * Forbidden response
   */
  static forbidden(message = "You do not have permission to perform this action."): OmniErrorResponse {
    return this.error(message, undefined, "FORBIDDEN");
  }

  /**
   * Validation error response
   */
  static validationError(errors: Record<string, string[]>, message = "Validation failed."): OmniErrorResponse {
    return this.error(message, errors, "VALIDATION_ERROR");
  }

  /**
   * Cursor-based pagination response
   */
  static cursorPaginate<T extends Record<string, unknown>>(
    data: T[],
    perPage: number,
    cursorKey = "id",
    message = "Success",
  ): OmniCursorResponse<T> {
    const hasMore = data.length === perPage;
    const nextCursor = hasMore && data.length > 0
      ? Buffer.from(JSON.stringify({ [cursorKey]: data[data.length - 1][cursorKey] })).toString("base64")
      : null;

    return {
      success: true,
      message,
      data: hasMore ? data.slice(0, -1) : data,
      cursor: {
        next: nextCursor,
        has_more: hasMore,
        per_page: perPage,
      },
    };
  }
}

// ----------------------------------------------
//  RESPONSE TYPE INTERFACES
// ----------------------------------------------

export interface OmniSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface OmniErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, unknown>;
  code?: string;
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  from: number;
  to: number;
  has_more: boolean;
  has_previous: boolean;
}

export interface OmniPaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface OmniCursorResponse<T> {
  success: true;
  message: string;
  data: T[];
  cursor: {
    next: string | null;
    has_more: boolean;
    per_page: number;
  };
}
