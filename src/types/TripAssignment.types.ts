// export interface TripAssignment {
//   _id: string;
//   booking_id: string;
//   driver_id: string;
//   vehicle_id: string;
//   staff_id: string;
//   driver_confirm: number;
//   low_occupancy_reason?: string;
//   assigned_at: string;
//   start_time?: string;
//   end_time?: string;
//   booking?: {
//     _id: string;
//     pickup_location: string;
//     dropoff_location: string;
//     trip_date: string;
//     passengers: number;
//     status: string;
//   };
//   driver?: {
//     _id: string;
//     name: string;
//     phone: string;
//   };
//   vehicle?: {
//     _id: string;
//     license_plate: string;
//     type_name?: string;
//     seats?: number;
//   };
// }

// export interface AssignDriverPayload {
//   bookingId: string;
//   driverId: string;
//   vehicleId: string;
//   staffId: string;
// }