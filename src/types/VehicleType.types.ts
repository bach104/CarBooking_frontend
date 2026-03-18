export interface VehicleType {
  _id: string;
  type_name: string;
  seats: number;
  base_price?: number;
  price_per_km?: number;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface PriceCalculation {
  vehicleType: VehicleType;
  distance: number;
  basePrice: number;
  extraFee: number;
  totalPrice: number;
}