export type BookingStatus = "Menunggu" | "Dikonfirmasi" | "Selesai" | "Dibatalkan";

export interface Staff {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_name: string;
  contact: string;
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
