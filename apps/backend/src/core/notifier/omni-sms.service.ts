import { Injectable, Logger } from '@nestjs/common';

export interface ISmsPayload {
  to: string;
  message: string;
}

@Injectable()
export class OmniSmsService {
  private readonly logger = new Logger(OmniSmsService.name);
  private driver: 'log' | 'http';

  constructor() {
    this.driver = (process.env.SMS_DRIVER as 'log' | 'http') || 'log';
  }

  async send(payload: ISmsPayload): Promise<boolean> {
    if (this.driver === 'log') {
      this.logger.log('================== [OMNI-SMS LOG DRIVER] ==================');
      this.logger.log(`Recipient: ${payload.to}`);
      this.logger.log(`Message:   ${payload.message}`);
      this.logger.log('===========================================================');
      return true;
    }

    this.logger.log(`Sending live SMS to ${payload.to}: ${payload.message}`);
    return true;
  }

  async sendOtp(phone: string, otpCode: string): Promise<boolean> {
    return this.send({
      to: phone,
      message: `Your OmniFlow verification code is: ${otpCode}. Valid for 5 minutes.`,
    });
  }
}
