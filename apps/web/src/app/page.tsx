'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'controller' | 'omnidb' | 'shared'>('controller');
  const [clock, setClock] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const coreEngines = [
    {
      icon: 'fas fa-file-pdf',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      title: 'বাংলা ইউনিকোড PDF ইনভয়েস ইঞ্জিন',
      tag: 'PdfService',
      desc: 'গুগল ফন্টস (Noto Sans Bengali, Kalpurush) এবং OpenType ligature shaping (kern 1, liga 1) এর মাধ্যমে জটিল যুক্তাক্ষর (ক্ষ, জ্ঞ, ঙ্গ, ঞ্চ, ষ্ণ) নির্ভুলভাবে রেন্ডারিং ও ব্রাউজার স্ট্রিমিং।',
    },
    {
      icon: 'fas fa-language',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      title: 'সংখ্যা থেকে কথায় রূপান্তর (বাংলা ও ইংরেজি)',
      tag: 'NumberToWords',
      desc: 'চেক, ব্যাংক ডিপোজিট ও ইনভয়েসের জন্য ০-৯৯, শত, হাজার, লক্ষ, কোটি এবং আন্তর্জাতিক মিলিয়ন/বিলিয়নে ভগ্নাংশসহ স্বয়ংক্রিয় কনভার্সন (যেমন: "এক হাজার পাঁচ শত টাকা পঞ্চাশ পয়সা মাত্র")।',
    },
    {
      icon: 'fas fa-calculator',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      title: 'প্রেসিশন ফিনান্সিয়াল ম্যাথ ইঞ্জিন',
      tag: 'Money Math',
      desc: 'ফ্লোটিং-পয়েন্ট এরর (0.1 + 0.2 !== 0.3) সম্পূর্ণ দূর করে ইন্টিজার সাব-ইউনিটে হিসাব সংরক্ষণ, সুষম ভ্যাট/ট্যাক্স হিসাব এবং ফ্র্যাকশনাল ডিসকাউন্ট ন্যায্য বণ্টন।',
    },
    {
      icon: 'fas fa-hdd',
      color: '#0ea5e9',
      bg: 'rgba(14, 165, 233, 0.12)',
      title: 'স্বয়ংক্রিয় Gzip ডাটাবেজ ব্যাকআপ ও রিস্টোর',
      tag: 'BackupService',
      desc: 'বিশুদ্ধ Node.js স্ট্রিমিং SQL ডাম্পার যা ব্যাকআপ ফাইলের আকার ৯৫% পর্যন্ত কমিয়ে ফেলে (.sql.gz) এবং অটো-রিটেনশন পলিসির মাধ্যমে স্বয়ংক্রিয়ভাবে ডিস্ক পরিষ্কার রাখে।',
    },
    {
      icon: 'fas fa-receipt',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
      title: 'সিকোয়েন্সিয়াল ভাউচার ও ইনভয়েস নাম্বারিং',
      tag: 'DocNumberService',
      desc: 'হাই-কনকারেন্সিতেও ডুপ্লিকেটহীন ধারাবাহিক ক্রমিক নম্বর তৈরি (INV-202609-00001, DHK/CH-0001), মাসিক/বার্ষিক অটোমেটিক রিসেট সুবিধা সহ।',
    },
    {
      icon: 'fas fa-history',
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.12)',
      title: 'অডিট ট্রেইল ও স্টেট ডিফ চেকার',
      tag: 'AuditService',
      desc: 'প্রতিটি অর্ডারে কে কখন কি পরিবর্তন করেছে তার ডিপ এট্রিবিউট ডিফারেন্স ডিটেকশন—আইপি, ইউজার এজেন্ট এবং টাইমস্ট্যাম্পসহ অডিট লগ সংরক্ষণ।',
    },
    {
      icon: 'fas fa-file-excel',
      color: '#14b8a6',
      bg: 'rgba(20, 184, 166, 0.12)',
      title: 'মেমোরি-সেফ স্ট্রিমিং এক্সপোর্ট',
      tag: 'ExportService',
      desc: 'সার্ভার মেমোরি ক্র্যাশ ছাড়াই ৫০,০০০+ অর্ডারের এক্সেল ও সিএসভি ফাইল রো-বাই-রো এইচটিটিপি স্ট্রিমিং; সাথে মাইক্রোসফট এক্সেলের জন্য UTF-8 BOM যুক্ত।',
    },
    {
      icon: 'fas fa-database',
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.12)',
      title: 'MySQL ও PostgreSQL ডুয়াল ডাটাবেজ',
      tag: 'OmniDB Engine',
      desc: 'একই কোডবেসে MySQL এবং PostgreSQL নির্বিঘ্নে পরিচালনা, জিরো-কোড চেঞ্জে ডাটাবেজ সুইচিং এবং ডেডলক হলে এক্সপোনেনশিয়াল ব্যাকঅফ দিয়ে স্বয়ংক্রিয় রিট্রাই।',
    },
  ];

  const codeSnippets = {
    controller: `// apps/backend/src/modules/orders/orders.controller.ts
@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Create enterprise order with pessimistic inventory lock' })
  async checkout(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.processCheckout(dto, user.id);
  }

  @Get(':id/invoice.pdf')
  @ApiOperation({ summary: 'Download Bengali Unicode PDF Invoice' })
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.pdfService.generateInvoice(id);
    return pdf.download(res, \`invoice-\${id}.pdf\`);
  }
}`,
    omnidb: `// apps/backend/src/core/database/omnidb.service.ts
export class OrdersService {
  async processCheckout(dto: CreateOrderDto, userId: string) {
    // Pessimistic Row-Level Lock & Deadlock Auto-Retry Engine
    return this.omniDb.transaction(async (trx) => {
      // 1. Lock stock row for atomic decrement
      const product = await trx.from('products')
        .where('id', dto.productId)
        .forUpdate()
        .first();

      if (product.stock < dto.quantity) {
        throw new BadRequestException('দুঃখিত, অপর্যাপ্ত স্টক!');
      }

      // 2. High-precision monetary math without floating point bugs
      const unitPrice = Money.fromDecimal(product.price);
      const totalAmount = unitPrice.multiply(dto.quantity);

      // 3. Monotonic Document Number generation
      const invoiceNo = await this.docNumberService.next('INV');

      return trx.insert('orders', {
        order_no: invoiceNo,
        user_id: userId,
        total_amount: totalAmount.toCents(),
        in_words_bn: NumberToWords.toBengali(totalAmount.toDecimal()),
      });
    }, { maxRetries: 3 });
  }
}`,
    shared: `// packages/shared/src/money/money.ts
export class Money {
  private readonly cents: number;

  constructor(cents: number) {
    this.cents = Math.round(cents);
  }

  static fromDecimal(amount: number): Money {
    return new Money(Math.round(amount * 100));
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.cents * factor));
  }

  // Prevents 0.1 + 0.2 === 0.30000000000000004
  toDecimal(): number {
    return this.cents / 100;
  }
}`,
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '0 24px 3.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '4.5rem',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      {/* =========================================================================
          1. HERO SECTION (ULTRA PREMIUM GLOW & ENGAGING MESSAGING)
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 2rem 4rem',
          borderRadius: '30px',
          background:
            'radial-gradient(circle at 50% 15%, rgba(230, 81, 0, 0.15) 0%, rgba(14, 165, 233, 0.05) 50%, transparent 100%)',
          border: '1px solid var(--border-color)',
          marginTop: '1.5rem',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'rgba(230, 81, 0, 0.18)',
            filter: 'blur(100px)',
            top: '-80px',
            left: '15%',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '380px',
            height: '380px',
            background: 'rgba(14, 165, 233, 0.15)',
            filter: 'blur(90px)',
            bottom: '-60px',
            right: '15%',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto' }}>
          {/* Pulsing Pill Badge */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 22px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '13.5px',
                background: 'rgba(230, 81, 0, 0.12)',
                color: 'var(--adm-primary)',
                border: '1px solid rgba(230, 81, 0, 0.3)',
                boxShadow: '0 4px 15px rgba(230, 81, 0, 0.15)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                }}
              />
              <span>আধুনিক ফুল-স্ট্যাক এন্টারপ্রাইজ ই-কমার্স ERP প্ল্যাটফর্ম</span>
              <span style={{ opacity: 0.6, fontSize: '11px', fontFamily: "'Inter', sans-serif" }}>
                {clock && `• ${clock}`}
              </span>
            </span>
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.5rem',
              color: 'var(--text-main)',
              fontFamily: "'Hind Siliguri', 'Inter', sans-serif",
            }}
          >
            ভবিষ্যতের ই-কমার্স ও বিজনেসের জন্য তৈরি —{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--adm-primary) 0%, #ff851b 60%, #ffcc02 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              OmniFlow ERP
            </span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              lineHeight: 1.8,
              marginBottom: '2.5rem',
              maxWidth: '800px',
              margin: '0 auto 2.5rem',
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            <strong>NestJS</strong> এন্টারপ্রাইজ ব্যাকএন্ড, <strong>Next.js ১৪</strong> আধুনিক অ্যাডমিন প্যানেল,{' '}
            <strong>React Native (Expo)</strong> মোবাইল অ্যাপ এবং <strong>MySQL ও PostgreSQL</strong> ডুয়াল-ডাটাবেজ।
            আপনার প্রতিষ্ঠানকে আগামী <strong>৫ থেকে ১০ বছর</strong> টেকসই ও অসীম স্কেলে পরিচালনা করার এক অনন্য সম্পূর্ণ সমাধান।
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/admin"
              className="btn-adm-primary"
              style={{
                height: '48px',
                padding: '0 32px',
                borderRadius: '9999px',
                fontSize: '16px',
                boxShadow: '0 6px 22px rgba(230, 81, 0, 0.45)',
              }}
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>অ্যাডমিন ERP প্যানেলে প্রবেশ করুন →</span>
            </Link>

            <a
              href="http://localhost:4000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="btn-adm-outline"
              style={{
                height: '48px',
                padding: '0 26px',
                borderRadius: '9999px',
                fontSize: '15px',
                fontWeight: 700,
                background: 'var(--card-bg)',
              }}
            >
              <i className="fas fa-book-open text-primary" style={{ color: 'var(--adm-primary)' }}></i>
              <span>Swagger API ডক্স (Live)</span>
              <i className="fas fa-external-link-alt" style={{ fontSize: '11px', opacity: 0.6 }}></i>
            </a>

            <Link
              href="/admin/orders"
              className="btn-adm-outline"
              style={{
                height: '48px',
                padding: '0 24px',
                borderRadius: '9999px',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              <i className="fas fa-shopping-cart text-warning"></i>
              <span>অর্ডার ও সেলস ডেমো</span>
            </Link>
          </div>

          {/* Quick Pillars Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              marginTop: '3.5rem',
              paddingTop: '2.5rem',
              borderTop: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '13.5px',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-cubes" style={{ color: 'var(--adm-primary)' }}></i>
              <span>TypeScript ফুল-স্ট্যাক মোনোরেপো</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-bolt" style={{ color: '#10b981' }}></i>
              <span>১২ms আল্ট্রা-লো ল্যাটেন্সি API</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-shield-alt" style={{ color: '#0ea5e9' }}></i>
              <span>JWT, RBAC ও ডেডলক রিট্রাই</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-robot" style={{ color: '#a855f7' }}></i>
              <span>Google Gemini AI প্রস্তুত</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. LIVE PERFORMANCE BENCHMARKS (METRICS & HIGHLIGHTS)
          ========================================================================= */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-purple" style={{ marginBottom: '10px' }}>
            ENTERPRISE PERFORMANCE
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            কেন OmniFlow রিয়েল-টাইম এন্টারপ্রাইজের প্রথম পছন্দ?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            লাখ লাখ ট্রানজ্যাকশন, হাই-ভলিউম ফ্ল্যাশ সেল এবং নিরবচ্ছিন্ন ব্যবসায়িক অপারেশন সামলানোর পরীক্ষিত সক্ষমতা।
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          <div className="live-stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              গড় রেসপন্স টাইম
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
              ১২ ms
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
              NestJS নন-ব্লকিং ইভেন্ট লুপ ও Redis L2 ক্যাশিংয়ের মাধ্যমে বিদ্যুৎগতির রেসপন্স।
            </p>
          </div>

          <div className="live-stat-card" style={{ borderLeft: '4px solid var(--adm-primary)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              সিস্টেম রিলায়েবিলিটি
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--adm-primary)', marginTop: '4px' }}>
              ৯৯.৯৯%
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
              অটো-রিকভারি, ডেডলক ইন্টারসেপশন এবং ট্রানজ্যাকশনাল আইসোলেশন সুরক্ষা।
            </p>
          </div>

          <div className="live-stat-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              স্ট্রিমিং এক্সপোর্ট
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0ea5e9', marginTop: '4px' }}>
              ৫০k+ Orders
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
              সার্ভারের র‍্যাম বা মেমোরি ক্র্যাশ না করেই বড় এক্সেল ও সিএসভি ডেটাসেট ডাউনলোড।
            </p>
          </div>

          <div className="live-stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              বাংলা ইউনিকোড সাপোর্ট
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>
              ১০০% নিখুঁত
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
              যেকোনো জটিল বাংলা যুক্তাক্ষর, ইনভয়েস ও মেমোতে কোনো ভাঙা ফন্ট ছাড়াই প্রিন্ট সুবিধা।
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. MONOREPO STACK (FOUR PILLARS)
          ========================================================================= */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-blue" style={{ marginBottom: '10px' }}>
            FULL-STACK MONOREPO
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            একই কোডবেসে ব্যাকএন্ড, ওয়েব এবং মোবাইল
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            Turborepo দিয়ে সুসংগঠিত আর্কিটেকচার যা আলাদা প্রজেক্টের জটিলতা দূর করে দেয়।
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card 1: Backend */}
          <div className="glass-card" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="badge badge-blue">apps/backend</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--adm-primary)', fontFamily: "'Inter', sans-serif" }}>
                Port :4000
              </span>
            </div>
            <div style={{ fontSize: '22px', marginBottom: '10px', color: '#e0234e' }}>
              <i className="fas fa-server"></i>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>NestJS API Engine</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              ডোমেন মডিউল (Auth, Orders, Inventory, Catalog, Users), OmniDB ORM, Persistent Queue, Gemini AI এবং Swagger OpenAPI।
            </p>
          </div>

          {/* Card 2: Web & Admin */}
          <div className="glass-card" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="badge badge-green">apps/web</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', fontFamily: "'Inter', sans-serif" }}>
                Port :3000
              </span>
            </div>
            <div style={{ fontSize: '22px', marginBottom: '10px', color: '#10b981' }}>
              <i className="fas fa-desktop"></i>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Next.js 14 Web & ERP</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              অত্যাধুনিক ই-কমার্স ক্যাটালগ ও স্টোরফ্রন্ট, প্লাস সম্পূর্ণ ফিচারযুক্ত Nursery ERP ধাঁচের অ্যাডমিন ড্যাশবোর্ড।
            </p>
          </div>

          {/* Card 3: Mobile App */}
          <div className="glass-card" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="badge badge-purple">apps/mobile</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#a855f7', fontFamily: "'Inter', sans-serif" }}>
                Port :8081
              </span>
            </div>
            <div style={{ fontSize: '22px', marginBottom: '10px', color: '#a855f7' }}>
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>React Native (Expo)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              আইওএস এবং অ্যান্ড্রয়েডের জন্য ক্রস-প্ল্যাটফর্ম মোবাইল অ্যাপ্লিকেশন, যা একই ব্যাকএন্ড এপিআই এবং শেয়ার্ড DTO ব্যবহার করে।
            </p>
          </div>

          {/* Card 4: Shared Types */}
          <div className="glass-card" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="badge badge-blue">packages/shared</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0ea5e9', fontFamily: "'Inter', sans-serif" }}>
                Shared Core
              </span>
            </div>
            <div style={{ fontSize: '22px', marginBottom: '10px', color: '#0ea5e9' }}>
              <i className="fas fa-cube"></i>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>@omniflow/shared</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              টাইপস্ক্রিপ্ট টাইপস, DTO ইন্টারফেস, Money ক্লাস এবং বাংলা ও ইংরেজি NumberToWords কনভার্টারের একক সোর্স অব ট্রুথ।
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. 8 MISSION-CRITICAL ERP CORE ENGINES SHOWCASE
          ========================================================================= */}
      <section id="erp-engines">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge" style={{ background: 'rgba(230, 81, 0, 0.15)', color: 'var(--adm-primary)', marginBottom: '10px' }}>
            BATTLE-TESTED ENGINES
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            ৮টি শক্তিশালী এন্টারপ্রাইজ ERP কোর ইঞ্জিন
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '750px', margin: '0 auto' }}>
            সাধারণ ই-কমার্স প্রজেক্টে যেসব জটিল ফিচার বানাতে মাসের পর মাস সময় লাগে, OmniFlow-তে তা প্রথম দিন থেকেই সম্পূর্ণ রেডি।
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '20px',
          }}
        >
          {coreEngines.map((engine, idx) => (
            <div
              key={idx}
              className="erp-module-card"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '24px',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: engine.bg,
                    color: engine.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  <i className={engine.icon}></i>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: 'var(--body-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontFamily: "'Inter', monospace",
                  }}
                >
                  {engine.tag}
                </span>
              </div>

              <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                {engine.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                {engine.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. INTERACTIVE ARCHITECTURE & CODE EXPLORER
          ========================================================================= */}
      <section id="code-explorer" style={{ width: '100%', minWidth: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-purple" style={{ marginBottom: '10px' }}>
            DEVELOPER-FIRST ARCHITECTURE
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            ক্লিন ও রিয়েল এন্টারপ্রাইজ কোড আর্কিটেকচার
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            ব্যাকএন্ড কন্ট্রোলার থেকে শুরু করে ডুয়াল-ডাটাবেজ ও শেয়ার্ড টাইপস্ক্রিপ্ট লাইব্রেরির নিখুঁত সংগঠন।
          </p>
        </div>

        <div
          style={{
            background: 'var(--card-bg)',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--card-shadow)',
            overflow: 'hidden',
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              background: 'var(--body-bg)',
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></span>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  marginLeft: '8px',
                  fontFamily: "'Inter', monospace",
                }}
              >
                OmniFlow Core Engine • Code Architecture
              </span>
            </div>

            {/* Code Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('controller')}
                style={{
                  background: activeTab === 'controller' ? 'var(--card-bg)' : 'transparent',
                  color: activeTab === 'controller' ? 'var(--adm-primary)' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: activeTab === 'controller' ? 'var(--border-color)' : 'transparent',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <i className="fas fa-file-code me-1"></i> OrdersController.ts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('omnidb')}
                style={{
                  background: activeTab === 'omnidb' ? 'var(--card-bg)' : 'transparent',
                  color: activeTab === 'omnidb' ? 'var(--adm-primary)' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: activeTab === 'omnidb' ? 'var(--border-color)' : 'transparent',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <i className="fas fa-database me-1"></i> OmniDbService.ts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('shared')}
                style={{
                  background: activeTab === 'shared' ? 'var(--card-bg)' : 'transparent',
                  color: activeTab === 'shared' ? 'var(--adm-primary)' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: activeTab === 'shared' ? 'var(--border-color)' : 'transparent',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <i className="fas fa-coins me-1"></i> Money.ts (@shared)
              </button>
            </div>
          </div>

          {/* Code Viewer Body */}
          <div style={{ padding: '20px', background: '#0b1120', overflowX: 'auto', maxWidth: '100%' }}>
            <pre
              style={{
                margin: 0,
                color: '#e2e8f0',
                fontFamily: "'Consolas', 'Courier New', monospace",
                fontSize: '13px',
                lineHeight: 1.65,
                whiteSpace: 'pre',
                maxWidth: '100%',
              }}
            >
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. LONG-TERM VALUE (5-10 YEAR SCALABILITY & ZERO TECH DEBT)
          ========================================================================= */}
      <section style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-green" style={{ marginBottom: '10px' }}>
            5 TO 10 YEARS FUTURE-PROOF GUARANTEE
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            কেন OmniFlow দীর্ঘমেয়াদে আপনার সেরা প্রযুক্তিগত সিদ্ধান্ত?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '700px', margin: '0 auto' }}>
            প্রতি বছর কোডবেস ফেলে নতুন করে বানানোর দিন শেষ। সুনির্দিষ্ট আর্কিটেকচারে গড়ে তোলা হয়েছে আপনার স্থায়ী ভিত্তি।
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '24px',
          }}
        >
          {/* ROI Card 1 */}
          <div
            className="glass-card"
            style={{
              padding: '28px',
              borderTop: '4px solid var(--adm-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(230, 81, 0, 0.12)',
                color: 'var(--adm-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              <i className="fas fa-layer-group"></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              জিরো টেকনিক্যাল ডেট
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              টাইপস্ক্রিপ্ট মোনোরেপো আর্কিটেকচার প্রতিটি সার্ভিসের দায়িত্ব স্পষ্ট রাখে। শত ইঞ্জিনিয়ার একসাথে কাজ করলেও কোড স্প্যাগেটি বা ভঙ্গুর হবে না।
            </p>
          </div>

          {/* ROI Card 2 */}
          <div
            className="glass-card"
            style={{
              padding: '28px',
              borderTop: '4px solid #10b981',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              <i className="fas fa-bolt"></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              ১০ গুণ ট্রাফিক হ্যান্ডলিং
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              নন-ব্লকিং ইভেন্ট লুপ, পেসিমিস্টিক ইনভেন্টরি লক এবং অটো-ডেডলক রিট্রাই ইঞ্জিনের কারণে ঈদ বা ফ্ল্যাশ সেলের প্রচণ্ড লোডেও সিস্টেম ক্র্যাশ করে না।
            </p>
          </div>

          {/* ROI Card 3 */}
          <div
            className="glass-card"
            style={{
              padding: '28px',
              borderTop: '4px solid #0ea5e9',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(14, 165, 233, 0.12)',
                color: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              <i className="fas fa-coins"></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              ন্যূনতম ক্লাউড ও সার্ভার খরচ
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
              বিশুদ্ধ Node.js স্ট্রিমিং ও মেমরি সেফ এক্সপোর্টের কারণে সাধারণ ২-৪ জিবি ভিপিএস সার্ভারেই লাখো ট্রানজ্যাকশন মসৃণভাবে পরিচালনা করা যায়।
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CALL TO ACTION (CTA BANNER - CONTAINED & BALANCED)
          ========================================================================= */}
      <section
        style={{
          borderRadius: '26px',
          padding: '3.5rem 2rem',
          background: 'linear-gradient(135deg, #0b1120 0%, #1e293b 60%, #111827 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Glow Spheres */}
        <div
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            background: 'rgba(230, 81, 0, 0.22)',
            filter: 'blur(80px)',
            top: '-50px',
            right: '15%',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '260px',
            height: '260px',
            background: 'rgba(14, 165, 233, 0.12)',
            filter: 'blur(70px)',
            bottom: '-40px',
            left: '10%',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '780px', margin: '0 auto' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(230, 81, 0, 0.18)',
              color: '#ff851b',
              fontSize: '12.5px',
              fontWeight: 700,
              marginBottom: '18px',
              border: '1px solid rgba(230, 81, 0, 0.35)',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
            <span>PROVEN ENTERPRISE FOUNDATION</span>
          </span>

          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              lineHeight: 1.35,
              marginBottom: '1rem',
              color: '#ffffff',
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            আপনার ব্যবসায় আনুন আধুনিক অটোমেশন ও শতভাগ নির্ভরযোগ্যতা
          </h2>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              marginBottom: '2.2rem',
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            দেরি না করে আজই এক্সপ্লোর করুন পূর্ণাঙ্গ OmniFlow ERP ড্যাশবোর্ড, লাইভ প্রোডাক্ট ক্যাটালগ এবং সুরক্ষিত RESTful এপিআই।
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/admin"
              className="btn-adm-primary"
              style={{
                height: '48px',
                padding: '0 28px',
                borderRadius: '9999px',
                fontSize: '15px',
                boxShadow: '0 6px 20px rgba(230, 81, 0, 0.45)',
              }}
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>লাইভ অ্যাডমিন প্যানেল খুলুন →</span>
            </Link>

            <a
              href="http://localhost:4000/api/docs"
              target="_blank"
              rel="noreferrer"
              style={{
                height: '48px',
                padding: '0 24px',
                borderRadius: '9999px',
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <i className="fas fa-book-open" style={{ color: 'var(--adm-primary)' }}></i>
              <span>Swagger API ডক্স (Live) ↗</span>
            </a>

            <Link
              href="/admin/orders"
              style={{
                height: '48px',
                padding: '0 22px',
                borderRadius: '9999px',
                fontSize: '14.5px',
                fontWeight: 600,
                color: '#ffc107',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                background: 'rgba(255, 193, 7, 0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <i className="fas fa-receipt"></i>
              <span>অর্ডার ও ইনভয়েস টেস্ট</span>
            </Link>
          </div>

          {/* Trust Highlights Checklist */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              marginTop: '2.8rem',
              paddingTop: '1.8rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
              <span>১০০% বাংলা ইউনিকোড সমর্থিত</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
              <span>MySQL ও PostgreSQL ডুয়াল ইঞ্জিন</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
              <span>জিরো-ডাউনটাইম অটো ব্যাকআপ</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
              <span>সম্পূর্ণ অডিট ট্রেইল ও আরব্যাক নিরাপত্তা</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
