export interface RevenueData {
  date: string;
  revenue: number;
}

export interface MonthlyRevenue {
  month: number;
  revenue: number;
}

export interface RevenueByVehicleType {
  _id: string;
  revenue: number;
  count: number;
}