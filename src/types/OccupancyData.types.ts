export interface OccupancyBooking {
  booking_id: string;
  passengers: number;
  pickup: string;
  dropoff: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface OccupancyData {
  vehicle_id: string;
  vehicle_license: string;
  vehicle_type: string;
  vehicle_seats: number;
  total_passengers: number;
  bookings: OccupancyBooking[];
}

export interface VehicleOccupancyDetails {
  vehicle: {
    id: string;
    license_plate: string;
    type_name: string;
    total_seats: number;
    occupied_seats: number;
    available_seats: number;
    occupancy_rate: string;
  };
  bookings: OccupancyBooking[];
}