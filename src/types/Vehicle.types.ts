export interface Vehicle {
  _id: string;
  vehicle_type_id: string;
  license_plate: string;
  status: 'available' | 'busy' | 'maintenance';
  created_at: string;
  updated_at: string;
  vehicleType?: {
    _id: string;
    type_name: string;
    seats: number;
  };
  type_name?: string;
  seats?: number;
  current_occupancy?: number;
  available_seats?: number;
}