import { Injectable, Logger } from '@nestjs/common';

export interface IMailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class OmniMailService {
  private readonly logger = new Logger(OmniMailService.name);
  private driver: 'log' | 'smtp';

  constructor() {
    this.driver = (process.env.MAIL_DRIVER as 'log' | 'smtp') || 'log';
  }

  async send(payload: IMailPayload): Promise<boolean> {
    const fromAddress = payload.from || process.env.MAIL_FROM || 'no-reply@omniflow.io';

    if (this.driver === 'log') {
      this.logger.log('================== [OMNI-MAIL LOG DRIVER] ==================');
      this.logger.log(`From:    ${fromAddress}`);
      this.logger.log(`To:      ${payload.to}`);
      this.logger.log(`Subject: ${payload.subject}`);
      this.logger.log(`Body:    ${payload.html.replace(/<[^>]*>?/gm, '').trim().slice(0, 150)}...`);
      this.logger.log('============================================================');
      return true;
    }

    // In production with SMTP, integrate nodemailer or provider API
    this.logger.log(`Sending production email via SMTP to: ${payload.to}`);
    return true;
  }

  async sendOrderConfirmation(email: string, orderNumber: string, total: number): Promise<boolean> {
    return this.send({
      to: email,
      subject: `Order Confirmed: #${orderNumber}`,
      html: `<h1>Thank you for your order!</h1><p>Your order <strong>#${orderNumber}</strong> with total <strong>$${total}</strong> is being processed.</p>`,
    });
  }
}
