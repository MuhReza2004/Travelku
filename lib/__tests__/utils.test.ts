import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatDateTime,
  getTodayString,
} from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats IDR correctly", () => {
    const result = formatCurrency(150000);
    expect(result).toContain("150");
    expect(result).toContain("000");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });

  it("handles large numbers", () => {
    const result = formatCurrency(1_000_000_000);
    expect(result).toContain("1");
  });
});

describe("formatDate", () => {
  it("formats to Indonesian long date", () => {
    const result = formatDate("2026-05-19");
    expect(result).toContain("Mei");
    expect(result).toContain("2026");
  });

  it("handles full ISO datetime string", () => {
    const result = formatDate("2026-05-19T10:30:00Z");
    expect(result).toContain("Mei");
  });
});

describe("formatDateShort", () => {
  it("formats to short Indonesian date", () => {
    const result = formatDateShort("2026-05-19");
    expect(result).toContain("Mei");
    expect(result).toContain("19");
  });
});

describe("formatDateTime", () => {
  it("formats with time", () => {
    const result = formatDateTime("2026-05-19T10:30:00Z");
    expect(result).toContain("Mei");
    expect(result).toMatch(/\d{2}\.\d{2}/);
  });
});

describe("getTodayString", () => {
  it("returns today in YYYY-MM-DD format", () => {
    const result = getTodayString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
