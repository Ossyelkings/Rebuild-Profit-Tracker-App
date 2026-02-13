export type BodyType = 
  | 'Sedan'
  | 'SUV'
  | 'Coupe'
  | 'Hatchback'
  | 'Wagon'
  | 'Convertible'
  | 'Pickup Truck'
  | 'Van'
  | 'Ute';

export type VehicleStatus = 'In Repair' | 'Completed' | 'Sold';

export type CostCategory = 
  | 'Parts' 
  | 'Labour' 
  | 'Mechanical' 
  | 'Paint & Body' 
  | 'Inspection' 
  | 'Registration' 
  | 'Transport' 
  | 'Miscellaneous';

export interface Cost {
  id: string;
  category: CostCategory;
  description: string;
  supplier: string;
  invoiceNumber: string;
  date: string;
  amount: number;
}

export interface CostTemplate {
  id: string;
  name: string;
  category: CostCategory;
  description: string;
  supplier: string;
  amount: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: 'status_change' | 'cost_added' | 'cost_edited' | 'cost_deleted' | 'vehicle_created' | 'vehicle_edited';
  description: string;
  details?: string;
}

export interface Vehicle {
  id: string;
  name?: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  odometer: number;
  auction: string;
  purchaseDate: string;
  purchasePrice: number;
  transportCost: number;
  estimatedSalePrice: number;
  status: VehicleStatus;
  images: string[];
  costs: Cost[];
  actualSalePrice?: number;
  soldDate?: string;
  registrationNumber?: string;
  registrationExpiryDate?: string;
  activityLog: ActivityLogEntry[];
  completedDate?: string;
  completionPhoto?: string; // Optional photo when status changed to Completed
  color?: string;
  bodyType?: BodyType;
  damageCondition?: string;
}

export interface DashboardStats {
  totalVehicles: number;
  totalInvested: number;
  projectedRevenue: number;
  totalProfit: number;
  statusCounts: Record<VehicleStatus, number>;
}