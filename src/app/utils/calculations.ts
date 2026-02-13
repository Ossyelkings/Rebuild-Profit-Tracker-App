import { Vehicle, DashboardStats, VehicleStatus } from '../types';

export const calculateTotalCosts = (vehicle: Vehicle): number => {
  return vehicle.costs.reduce((sum, cost) => sum + cost.amount, 0);
};

export function calculateTotalInvestment(vehicle: Vehicle): number {
  const totalCosts = calculateTotalCosts(vehicle);
  return vehicle.purchasePrice + vehicle.transportCost + totalCosts;
}

export const calculateProfit = (vehicle: Vehicle): number => {
  const salePrice = vehicle.actualSalePrice || vehicle.estimatedSalePrice;
  return salePrice - calculateTotalInvestment(vehicle);
};

export const calculateROI = (vehicle: Vehicle): number => {
  const investment = calculateTotalInvestment(vehicle);
  if (investment === 0) return 0;
  return (calculateProfit(vehicle) / investment) * 100;
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isRegistrationExpired(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  const today = new Date();
  const expiry = new Date(expiryDate);
  return expiry < today;
}

export function getRegistrationDaysRemaining(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getDaysInRepair(vehicle: Vehicle): number | null {
  const purchaseDate = new Date(vehicle.purchaseDate);
  const endDate = vehicle.completedDate ? new Date(vehicle.completedDate) : 
                  (vehicle.status === 'Completed' || vehicle.status === 'Sold') ? new Date() : null;
  
  if (!endDate) {
    // Vehicle still in repair - calculate from purchase to today
    const today = new Date();
    const diffTime = today.getTime() - purchaseDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  const diffTime = endDate.getTime() - purchaseDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysToSale(vehicle: Vehicle): number | null {
  if (!vehicle.soldDate) return null;
  
  const purchaseDate = new Date(vehicle.purchaseDate);
  const soldDate = new Date(vehicle.soldDate);
  const diffTime = soldDate.getTime() - purchaseDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysInInventory(vehicle: Vehicle): number {
  const purchaseDate = new Date(vehicle.purchaseDate);
  const endDate = vehicle.soldDate ? new Date(vehicle.soldDate) : new Date();
  const diffTime = endDate.getTime() - purchaseDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getAverageTurnaroundTime(vehicles: Vehicle[]): number {
  const soldVehicles = vehicles.filter(v => v.soldDate);
  if (soldVehicles.length === 0) return 0;
  
  const totalDays = soldVehicles.reduce((sum, vehicle) => {
    const days = getDaysToSale(vehicle) || 0;
    return sum + days;
  }, 0);
  
  return Math.round(totalDays / soldVehicles.length);
}

export const calculateDashboardStats = (vehicles: Vehicle[]): DashboardStats => {
  const statusCounts: Record<VehicleStatus, number> = {
    'In Repair': 0,
    'Completed': 0,
    'Sold': 0,
  };

  let totalInvested = 0;
  let projectedRevenue = 0;
  let totalProfit = 0;

  vehicles.forEach(vehicle => {
    statusCounts[vehicle.status]++;
    const investment = calculateTotalInvestment(vehicle);
    totalInvested += investment;
    projectedRevenue += vehicle.actualSalePrice || vehicle.estimatedSalePrice;
    totalProfit += calculateProfit(vehicle);
  });

  return {
    totalVehicles: vehicles.length,
    totalInvested,
    projectedRevenue,
    totalProfit,
    statusCounts,
  };
};