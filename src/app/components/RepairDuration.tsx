import { Vehicle } from '../types';
import { getDaysInRepair, getDaysToSale, getDaysInInventory } from '../utils/calculations';
import { Clock, Calendar, TrendingUp } from 'lucide-react';

interface RepairDurationProps {
  vehicle: Vehicle;
}

export function RepairDuration({ vehicle }: RepairDurationProps) {
  const daysInRepair = getDaysInRepair(vehicle);
  const daysToSale = getDaysToSale(vehicle);
  const daysInInventory = getDaysInInventory(vehicle);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h2 className="text-xl mb-4">Duration Tracking</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Days in Repair */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              {vehicle.status === 'In Repair' ? 'Days in Repair (Ongoing)' : 'Days in Repair'}
            </div>
            <div className="text-2xl">
              {daysInRepair !== null ? `${daysInRepair} day${daysInRepair !== 1 ? 's' : ''}` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Days in Inventory */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              {vehicle.status === 'Sold' ? 'Total Days to Sale' : 'Days in Inventory'}
            </div>
            <div className="text-2xl">
              {daysInInventory} day{daysInInventory !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Days to Sale (only if sold) */}
        {vehicle.status === 'Sold' && daysToSale !== null && (
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Total Turnaround Time</div>
              <div className="text-2xl">
                {daysToSale} day{daysToSale !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                From purchase to sale
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
