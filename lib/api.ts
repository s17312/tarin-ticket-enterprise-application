import { authHeader } from "@/lib/auth";

const BOOKING_API = process.env.NEXT_PUBLIC_BOOKING_API_URL ?? "http://localhost:5011";
const ANALYTICS_API = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || BOOKING_API;

export type SpecialRequestDto = { id: number; type: number; details: string | null };
export type SpecialRequestInput = { type: number; details: string | null };

export type BookingDto = {
  id: number;
  userId: string | null;
  travelDate: string;
  routeId: number;
  routeDisplayName: string | null;
  departureTime: string;
  arrivalTime: string;
  seatNumber: string;
  seatClass: number;
  farePrice: number;
  status: string;
  isRecurring: boolean;
  recurrenceDays: number[] | null;
  recurrenceEndDate: string | null;
  recurrenceOccurrences: number | null;
  seriesId: string | null;
  specialRequests: SpecialRequestDto[];
};

export type PagedResult<T> = { items: T[]; page: number; pageSize: number; totalCount: number; totalPages: number };

export type RouteDto = { id: number; originName: string; destinationName: string; displayName: string };

export type CreateBookingRequest = {
  travelDate: string;
  routeId: number;
  departureTime: string;
  arrivalTime: string;
  seatNumber: string;
  seatClass: number;
  farePrice: number;
  isRecurring: boolean;
  recurrenceDays?: number[];
  recurrenceEndDate?: string | null;
  recurrenceOccurrences?: number | null;
  specialRequests?: SpecialRequestInput[];
};

export type UpdateBookingRequest = {
  travelDate: string;
  routeId: number;
  departureTime: string;
  arrivalTime: string;
  seatNumber: string;
  seatClass: number;
  farePrice: number;
  keepInRecurringSeries: boolean;
  specialRequests?: SpecialRequestInput[];
};

export type CreateBookingResponse = {
  success: boolean;
  createdBookings: BookingDto[];
  skippedDates: string[];
  usedDefaultOccurrenceLimit: boolean;
  errors: { field: string; message: string }[];
};

export type WeeklyReportDto = {
  weekStart: string;
  weekEnd: string;
  totalBookings: number;
  totalRoutesTravelled: number;
  totalFareValue: number;
  dataAsOf: string | null;
  days: {
    date: string;
    dayOfWeek: string;
    bookings: { id: number; routeId: number; routeDisplayName: string; departureTime: string; seatNumber: string; farePrice: number; status: string }[];
  }[];
};

export type PredictionResponse = { success: boolean; message: string; confidence: string };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const bookingApi = {
  search: (params: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") query.set(k, String(v));
    });
    return fetch(`${BOOKING_API}/api/bookings?${query.toString()}`, { cache: "no-store" }).then((r) => json<PagedResult<BookingDto>>(r));
  },
  getById: (id: number) => fetch(`${BOOKING_API}/api/bookings/${id}`, { cache: "no-store" }).then((r) => json<BookingDto>(r)),
  mine: () => fetch(`${BOOKING_API}/api/bookings/mine`, { headers: authHeader(), cache: "no-store" }).then((r) => json<BookingDto[]>(r)),
  create: (body: CreateBookingRequest) =>
    fetch(`${BOOKING_API}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(body),
    }).then((r) => json<CreateBookingResponse>(r)),
  update: (id: number, body: UpdateBookingRequest) =>
    fetch(`${BOOKING_API}/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(body),
    }),
  cancel: (id: number) => fetch(`${BOOKING_API}/api/bookings/${id}/cancel`, { method: "POST", headers: authHeader() }),
  remove: (id: number) => fetch(`${BOOKING_API}/api/bookings/${id}`, { method: "DELETE", headers: authHeader() }),
  routes: () => fetch(`${BOOKING_API}/api/routes`, { cache: "no-store" }).then((r) => json<RouteDto[]>(r)),
};

export const analyticsApi = {
  weeklyReport: (week?: string) =>
    fetch(`${ANALYTICS_API}/api/reports/weekly${week ? `?week=${week}` : ""}`, { cache: "no-store" }).then((r) => json<WeeklyReportDto>(r)),
  predict: (routeId: number, travelDate: string) =>
    fetch(`${ANALYTICS_API}/api/predict?routeId=${routeId}&travelDate=${travelDate}`, { cache: "no-store" }).then((r) => json<PredictionResponse>(r)),
};

export const SEAT_CLASS_LABELS = ["Standard", "FirstClass"];
export const SPECIAL_REQUEST_LABELS = ["WheelchairAssistance", "ExtraLuggage", "MealPreference", "Other"];
export const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
