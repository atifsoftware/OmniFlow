import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'omni_throttle';
export interface IThrottleOptions {
  limit: number;
  ttlSeconds: number;
}

export const Throttle = (
  limitOrOptions: number | IThrottleOptions,
  ttlSeconds = 60,
) => {
  const options: IThrottleOptions =
    typeof limitOrOptions === 'number'
      ? { limit: limitOrOptions, ttlSeconds }
      : limitOrOptions;
  return SetMetadata(THROTTLE_KEY, options);
};
