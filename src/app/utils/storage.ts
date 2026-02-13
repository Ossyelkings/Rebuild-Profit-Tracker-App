import { Vehicle, CostTemplate } from '../types';

const VEHICLES_KEY = 'rebuild_profit_tracker_vehicles';
const TEMPLATES_KEY = 'rebuild_profit_tracker_cost_templates';

export function saveVehicles(vehicles: Vehicle[]): void {
  try {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  } catch (error) {
    console.error('Error saving vehicles:', error);
  }
}

export function loadVehicles(): Vehicle[] {
  try {
    const data = localStorage.getItem(VEHICLES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading vehicles:', error);
    return [];
  }
}

export function saveCostTemplates(templates: CostTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving cost templates:', error);
  }
}

export function loadCostTemplates(): CostTemplate[] {
  try {
    const data = localStorage.getItem(TEMPLATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading cost templates:', error);
    return [];
  }
}
