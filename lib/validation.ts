import type { BookingFormData } from "./types";
import type { ValidationError } from "./types";

export function validateBooking(data: Partial<BookingFormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.customer_name?.trim()) {
    errors.push({ field: "customer_name", message: "Nama pemesan wajib diisi" });
  }

  if (!data.contact?.trim()) {
    errors.push({ field: "contact", message: "Kontak (telepon/email) wajib diisi" });
  }

  if (!data.package_name?.trim()) {
    errors.push({ field: "package_name", message: "Paket wisata wajib diisi" });
  }

  if (!data.departure_date) {
    errors.push({ field: "departure_date", message: "Tanggal keberangkatan wajib diisi" });
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const depDate = new Date(data.departure_date);
    if (isNaN(depDate.getTime())) {
      errors.push({ field: "departure_date", message: "Format tanggal tidak valid" });
    } else if (depDate < today) {
      errors.push({
        field: "departure_date",
        message: "Tanggal keberangkatan tidak boleh di masa lalu",
      });
    }
  }

  const participants = Number(data.participants);
  if (!Number.isInteger(participants) || participants < 1) {
    errors.push({ field: "participants", message: "Jumlah peserta minimal 1" });
  }

  const price = Number(data.price_per_person);
  if (isNaN(price) || price < 0) {
    errors.push({ field: "price_per_person", message: "Harga per orang tidak boleh negatif" });
  }

  return errors;
}
