import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface IOmniContextStore {
  traceId: string;
  user?: any;
  tenantId?: string;
  [key: string]: any;
}

@Injectable()
export class OmniContextService {
  private static readonly storage = new AsyncLocalStorage<IOmniContextStore>();

  run<R>(store: IOmniContextStore, fn: () => R): R {
    return OmniContextService.storage.run(store, fn);
  }

  getStore(): IOmniContextStore | undefined {
    return OmniContextService.storage.getStore();
  }

  getTraceId(): string {
    return this.getStore()?.traceId || 'N/A';
  }

  getCurrentUser(): any {
    return this.getStore()?.user;
  }

  setCurrentUser(user: any): void {
    const store = this.getStore();
    if (store) {
      store.user = user;
    }
  }
}
