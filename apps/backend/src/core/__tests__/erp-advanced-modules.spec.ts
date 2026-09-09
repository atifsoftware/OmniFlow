import { NumberToWords, Money } from "@omniflow/shared";
import { PdfService } from "../pdf/pdf.service";
import { DocNumberService } from "../database/doc-number.service";
import { AuditService } from "../database/audit.service";
import { ExportService } from "../helpers/export.service";
import { BackupService } from "../database/backup.service";
import { QueryBuilder } from "../database/query-builder";
import * as fs from "fs";

describe("OmniFlow Enterprise ERP Core Engines", () => {
  describe("NumberToWords Engine", () => {
    it("should convert numbers to English words", () => {
      expect(NumberToWords.toEnglish(1500)).toBe("One Thousand Five Hundred");
      expect(NumberToWords.toEnglish(1250000, { useLakhCrore: true })).toBe("Twelve Lakh Fifty Thousand");
      expect(NumberToWords.toEnglish(1250000, { useLakhCrore: false })).toBe("One Million Two Hundred Fifty Thousand");
    });

    it("should convert numbers to Bengali words", () => {
      expect(NumberToWords.toBangla(0)).toBe("শূন্য");
      expect(NumberToWords.toBangla(15)).toBe("পনেরো");
      expect(NumberToWords.toBangla(100)).toBe("এক শত");
      expect(NumberToWords.toBangla(1500)).toBe("এক হাজার পাঁচ শত");
      const croreVal = NumberToWords.toBangla(10050000);
      expect(croreVal).toContain("কোটি");
      expect(croreVal).toContain("পঞ্চাশ হাজার");
    });

    it("should format currency in-words for invoices (টাকা ও পয়সা মাত্র)", () => {
      const bn = NumberToWords.toCurrencyWords(1500.50, { language: "bn", currency: "BDT" });
      expect(bn).toContain("টাকা");
      expect(bn).toContain("পয়সা");
      expect(bn).toMatch(/মাত্র$/);

      const en = NumberToWords.toCurrencyWords(2500.75, { language: "en", currency: "BDT" });
      expect(en).toContain("Two Thousand Five Hundred Taka");
      expect(en).toContain("Seventy Five Paisa");
      expect(en).toMatch(/Only$/);
    });
  });

  describe("Money Financial Precision Math", () => {
    it("should perform floating-point error-free arithmetic", () => {
      const m1 = new Money(0.1);
      const m2 = new Money(0.2);
      const sum = m1.add(m2);
      expect(sum.amount).toBe(0.3);
      expect(sum.cents).toBe(30);
      const sub = sum.subtract(new Money(0.05));
      expect(sub.amount).toBe(0.25);
    });

    it("should calculate tax and percentage correctly", () => {
      const price = new Money(1000);
      const { tax, total } = price.applyTax(15);
      expect(tax.amount).toBe(150);
      expect(total.amount).toBe(1150);
    });

    it("should fairly distribute remainder in ratio allocation", () => {
      const total = new Money(100);
      const shares = total.allocate([1, 1, 1]);
      expect(shares.length).toBe(3);
      expect(shares[0].amount).toBe(33.34);
      expect(shares[1].amount).toBe(33.33);
      expect(shares[2].amount).toBe(33.33);
      expect(shares[0].cents + shares[1].cents + shares[2].cents).toBe(10000);
    });
  });

  describe("PdfService (HTML-to-PDF with Bengali Unicode)", () => {
    let pdfService: PdfService;
    beforeEach(() => {
      pdfService = new PdfService();
    });

    it("should inject Bengali Unicode fonts and OpenType ligature shaping CSS", () => {
      const doc = pdfService.loadHtml("<h1>চালানপত্র</h1><p class='bn-text'>অর্ডার চালান</p>");
      const html = doc.toHtml();
      expect(html).toContain("Noto Sans Bengali");
      expect(html).toContain('font-feature-settings: "kern" 1, "liga" 1');
      expect(html).toContain("চালানপত্র");
    });

    it("should render PDF binary buffer", async () => {
      const doc = pdfService.loadHtml("<p>Invoice Report</p>");
      const buffer = await doc.toBuffer();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("DocNumberService", () => {
    it("should format sequential patterns with zero padding and date tokens", () => {
      const fixedDate = new Date("2026-09-15");
      const formatted = DocNumberService.formatPattern("{PREFIX}-{YYYY}{MM}-{00001}", 42, {
        PREFIX: "INV",
        date: fixedDate,
      });
      expect(formatted).toBe("INV-202609-00042");
    });

    it("should incorporate custom branch tokens", () => {
      const formatted = DocNumberService.formatPattern("{BRANCH}/{PREFIX}-{0001}", 7, {
        PREFIX: "CH",
        BRANCH: "CTG",
        date: new Date("2026-09-15"),
      });
      expect(formatted).toBe("CTG/CH-0007");
    });
  });

  describe("AuditService", () => {
    it("should compute attribute diff between old and new state", () => {
      const oldState = { id: 10, name: "Product A", price: 100, stock: 50, updatedAt: "2026-01-01" };
      const newState = { id: 10, name: "Product A", price: 120, stock: 45, updatedAt: "2026-09-09" };
      const { oldValues, newValues } = AuditService.diff(oldState, newState);
      expect(oldValues).toEqual({ price: 100, stock: 50 });
      expect(newValues).toEqual({ price: 120, stock: 45 });
      expect(oldValues.updatedAt).toBeUndefined();
    });
  });

  describe("ExportService", () => {
    it("should sanitize dangerous formulas to prevent CSV injection vulnerabilities", () => {
      const dangerous = "=cmd|'/C calc'!A0";
      const sanitized = ExportService.sanitizeCell(dangerous);
      expect(sanitized.startsWith("'=")).toBe(false);
      expect(sanitized.startsWith('"\'=')).toBe(true);
      const normal = 'OmniFlow "ERP"';
      expect(ExportService.sanitizeCell(normal)).toBe('"OmniFlow ""ERP"""');
    });

    it("should stream CSV rows with UTF-8 BOM for Microsoft Excel Bengali support", async () => {
      const chunks: string[] = [];
      const headers: Record<string, string> = {};
      const mockRes: any = {
        setHeader: (k: string, v: string) => { headers[k] = v; },
        write: (c: string) => { chunks.push(c); return true; },
        end: () => { chunks.push("__END__"); },
      };
      const exportService = new ExportService();
      const rows = [{ id: 1, title: "সফটওয়্যার লাইসেন্স", price: 15000 }];
      const cols = [
        { key: "id", label: "আইডি" },
        { key: "title", label: "বিবরণ" },
        { key: "price", label: "মূল্য", formatter: (val: number) => "৳ " + val.toFixed(2) },
      ];
      await exportService.toCsvStream(rows, cols, mockRes, "test.csv");
      expect(headers["Content-Type"]).toContain("text/csv");
      expect(chunks[0]).toBe("\uFEFF");
      const full = chunks.join("");
      expect(full).toContain('"আইডি","বিবরণ","মূল্য"');
      expect(full).toContain("সফটওয়্যার লাইসেন্স");
      expect(full).toContain("৳ 15000.00");
    });
  });

  describe("BackupService", () => {
    it("should resolve backup directory correctly", () => {
      const dir = BackupService.getBackupDir();
      expect(fs.existsSync(dir)).toBe(true);
    });
  });

  describe("QueryBuilder Pessimistic Locking", () => {
    it("should append FOR UPDATE to SQL when forUpdate() is called", () => {
      const qb = new QueryBuilder("orders", {} as any);
      qb.where("id", 1).forUpdate();
      expect(qb.toSql()).toContain("FOR UPDATE");
    });

    it("should append LOCK IN SHARE MODE when sharedLock() is called", () => {
      const qb = new QueryBuilder("products", {} as any);
      qb.where("id", 1).sharedLock();
      expect(qb.toSql()).toContain("LOCK IN SHARE MODE");
    });
  });
});
