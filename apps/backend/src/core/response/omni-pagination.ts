/**
 * OmniFlow Pagination Helper
 * Inspired by NodeFlow-React Pagination.js
 * Computes pagination metadata from total count, page and perPage.
 */
export class OmniPagination {
  private _total: number;
  private _perPage: number;
  private _currentPage: number;

  constructor(total: number, perPage = 20, currentPage = 1) {
    this._total = parseInt(String(total)) || 0;
    this._perPage = parseInt(String(perPage)) || 20;
    this._currentPage = parseInt(String(currentPage)) || 1;
  }

  static make(total: number, perPage = 20, currentPage = 1): OmniPagination {
    return new OmniPagination(total, perPage, currentPage);
  }

  total(): number { return this._total; }
  perPage(): number { return this._perPage; }
  currentPage(): number { return this._currentPage; }
  totalPages(): number { return Math.ceil(this._total / this._perPage) || 1; }
  hasMore(): boolean { return this._currentPage < this.totalPages(); }
  hasPrevious(): boolean { return this._currentPage > 1; }
  offset(): number { return (this._currentPage - 1) * this._perPage; }
  limit(): number { return this._perPage; }
  from(): number { return this.offset() + 1; }
  to(): number { return Math.min(this._currentPage * this._perPage, this._total); }

  toArray(): Record<string, unknown> {
    return {
      total: this._total,
      per_page: this._perPage,
      current_page: this._currentPage,
      total_pages: this.totalPages(),
      from: this.from(),
      to: this.to(),
      has_more: this.hasMore(),
      has_previous: this.hasPrevious(),
    };
  }
}

// ----------------------------------------------
//  CURSOR PAGINATION HELPER
// ----------------------------------------------

export class OmniCursorPagination {
  static decode(cursor: string | undefined): Record<string, unknown> | null {
    if (!cursor) return null;
    try {
      return JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
    } catch {
      return null;
    }
  }

  static encode(data: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(data)).toString("base64");
  }
}
