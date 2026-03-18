export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
}

export interface CustomerWithBookings extends Customer {
  bookings: any[];
}