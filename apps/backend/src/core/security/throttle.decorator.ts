import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'omni_throttle';
export interface IThrottleOptions {
  limit: number;
  ttlSeconds: number;
}

export const Throttle = (options: IThrottleOptions) => SetMetadata(THROTTLE_KEY, options);
