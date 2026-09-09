/**
 * Enterprise Precision Financial Math Engine for OmniFlow
 * 
 * Solves JavaScript floating-point representation bugs (e.g. 0.1 + 0.2 === 0.30000000000000004).
 * Stores amounts internally as integer sub-units (pennies/paisa).
 */

export class Money {
  private _cents: number;
  private _currency: string;

  constructor(amount: number | string = 0, currency = 'BDT') {
    const num = parseFloat(String(amount)) || 0;
    this._cents = Math.round(num * 100);
    this._currency = currency.toUpperCase();
  }

  static fromCents(cents: number, currency = 'BDT'): Money {
    const m = new Money(0, currency);
    m._cents = Math.round(cents);
    return m;
  }

  get amount(): number {
    return this._cents / 100;
  }

  get cents(): number {
    return this._cents;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money | number): Money {
    const addCents = other instanceof Money ? other.cents : Math.round(parseFloat(String(other)) * 100);
    return Money.fromCents(this._cents + addCents, this._currency);
  }

  subtract(other: Money | number): Money {
    const subCents = other instanceof Money ? other.cents : Math.round(parseFloat(String(other)) * 100);
    return Money.fromCents(this._cents - subCents, this._currency);
  }

  multiply(factor: number): Money {
    return Money.fromCents(Math.round(this._cents * factor), this._currency);
  }

  divide(divisor: number): Money {
    if (divisor === 0) throw new Error('Cannot divide financial amount by zero');
    return Money.fromCents(Math.round(this._cents / divisor), this._currency);
  }

  percentage(percent: number): Money {
    return Money.fromCents(Math.round((this._cents * percent) / 100), this._currency);
  }

  applyTax(ratePercent: number): { tax: Money; total: Money } {
    const tax = this.percentage(ratePercent);
    const total = this.add(tax);
    return { tax, total };
  }

  allocate(ratios: number[]): Money[] {
    const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
    if (totalRatio <= 0) throw new Error('Sum of ratios must be greater than zero');

    let remainder = this._cents;
    const results: Money[] = [];

    for (const ratio of ratios) {
      const share = Math.floor((this._cents * ratio) / totalRatio);
      results.push(Money.fromCents(share, this._currency));
      remainder -= share;
    }

    for (let i = 0; i < remainder; i++) {
      results[i]._cents += 1;
    }

    return results;
  }

  isZero(): boolean {
    return this._cents === 0;
  }

  isPositive(): boolean {
    return this._cents > 0;
  }

  isNegative(): boolean {
    return this._cents < 0;
  }

  equals(other: Money): boolean {
    return this._cents === other._cents && this._currency === other._currency;
  }

  format(locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency === 'BDT' ? 'BDT' : this._currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this.amount);
  }

  toString(): string {
    return (this._cents / 100).toFixed(2);
  }

  toJSON(): { amount: number; cents: number; currency: string; formatted: string } {
    return {
      amount: this.amount,
      cents: this._cents,
      currency: this._currency,
      formatted: this.format()
    };
  }
}
