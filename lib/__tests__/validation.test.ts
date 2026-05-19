import { describe, it, expect } from "vitest";
import { validateBooking } from "@/lib/validation";

const validData = {
  customer_name: "John Doe",
  contact: "08123456789",
  package_name: "Paket Bali",
  package_id: "abc-123",
  departure_date: "2099-12-31",
  participants: 2,
  price_per_person: 500000,
  notes: "",
};

describe("validateBooking", () => {
  it("returns no errors for valid data", () => {
    const errors = validateBooking(validData);
    expect(errors).toHaveLength(0);
  });

  it("requires customer_name", () => {
    const errors = validateBooking({ ...validData, customer_name: "" });
    expect(errors).toContainEqual({
      field: "customer_name",
      message: "Nama pemesan wajib diisi",
    });
  });

  it("requires contact", () => {
    const errors = validateBooking({ ...validData, contact: "" });
    expect(errors).toContainEqual({
      field: "contact",
      message: "Kontak (telepon/email) wajib diisi",
    });
  });

  it("requires package_name", () => {
    const errors = validateBooking({ ...validData, package_name: "" });
    expect(errors).toContainEqual({
      field: "package_name",
      message: "Paket wisata wajib diisi",
    });
  });

  it("requires departure_date", () => {
    const errors = validateBooking({ ...validData, departure_date: "" });
    expect(errors).toContainEqual({
      field: "departure_date",
      message: "Tanggal keberangkatan wajib diisi",
    });
  });

  it("rejects past departure_date", () => {
    const errors = validateBooking({ ...validData, departure_date: "2020-01-01" });
    expect(errors).toContainEqual({
      field: "departure_date",
      message: "Tanggal keberangkatan tidak boleh di masa lalu",
    });
  });

  it("rejects invalid date format", () => {
    const errors = validateBooking({ ...validData, departure_date: "not-a-date" });
    expect(errors).toContainEqual({
      field: "departure_date",
      message: "Format tanggal tidak valid",
    });
  });

  it("requires participants >= 1", () => {
    const errors = validateBooking({ ...validData, participants: 0 });
    expect(errors).toContainEqual({
      field: "participants",
      message: "Jumlah peserta minimal 1",
    });
  });

  it("rejects non-integer participants", () => {
    const errors = validateBooking({ ...validData, participants: 1.5 as unknown as number });
    expect(errors).toContainEqual({
      field: "participants",
      message: "Jumlah peserta minimal 1",
    });
  });

  it("rejects negative price", () => {
    const errors = validateBooking({ ...validData, price_per_person: -1 });
    expect(errors).toContainEqual({
      field: "price_per_person",
      message: "Harga per orang tidak boleh negatif",
    });
  });

  it("allows zero price", () => {
    const errors = validateBooking({ ...validData, price_per_person: 0 });
    expect(errors).toHaveLength(0);
  });

  it("returns multiple errors at once", () => {
    const errors = validateBooking({
      customer_name: "",
      contact: "",
      package_name: "",
      package_id: "",
      departure_date: "",
      participants: 0,
      price_per_person: -1,
      notes: "",
    });
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });
});
