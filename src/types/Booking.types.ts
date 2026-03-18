export interface Booking {
  _id: string;
  customer_id: string;
  pickup_location: string;
  dropoff_location: string;
  trip_date: string;
  passengers: number;
  vehicle_type_id: string;
  price: number;
  payment_method: 'cash' | 'transfer';
  status: 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  low_occupancy_reason?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
  };
  vehicleType?: {
    _id: string;
    type_name: string;
    seats: number;
  };
  tripAssignment?: {
    _id: string;
    driver_id: string;
    vehicle_id: string;
    driver_confirm: number;
    assigned_at: string;
  };
}

export interface CreateBookingPayload {
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  booking: {
    pickup: string;
    dropoff: string;
    date: string;
    passengers: number;
    vehicleTypeId: string;
    price: number;
    paymentMethod: 'cash' | 'transfer';
  };
}