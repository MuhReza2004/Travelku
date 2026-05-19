export type BookingStatus = "Menunggu" | "Dikonfirmasi" | "Selesai" | "Dibatalkan";
export type StaffRole = "admin" | "staff";
export type AuditAction = "created" | "updated" | "status_changed" | "deleted";

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  destination: string;
  duration: string;
  description: string;
  capacity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_name: string;
  contact: string;
  package_id: string | null;
  package_name: string;
  departure_date: string;
  participants: number;
  price_per_person: number;
  status: BookingStatus;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  customer_name: string;
  contact: string;
  package_id: string;
  package_name: string;
  departure_date: string;
  participants: number;
  price_per_person: number;
  notes: string;
}

export interface BookingFilters {
  status: BookingStatus | "";
  package_name: string;
  date_from: string;
  date_to: string;
  search: string;
  page: number;
  page_size: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  errors?: ValidationError[];
}

export interface BookingAuditLog {
  id: string;
  booking_id: string;
  staff_id: string;
  staff_name?: string;
  action: AuditAction;
  changes: Record<string, unknown>;
  created_at: string;
}
