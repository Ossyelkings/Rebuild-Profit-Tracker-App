import { Vehicle } from '../types';
import { calculateTotalInvestment, calculateProfit, calculateROI, formatCurrency, isRegistrationExpired, getRegistrationDaysRemaining } from '../utils/calculations';
import { exportVehiclesToCSV } from '../utils/csvExport';
import { Car, Plus, ChevronRight, Filter, Search, X, TrendingUp, TrendingDown, AlertTriangle, FileDown, ArrowUpDown, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface VehiclesListProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicleId: string) => void;
  onAddVehicle: () => void;
}

type SortOption = 'date-newest' | 'date-oldest' | 'profit-high' | 'profit-low' | 'investment-high' | 'investment-low';

export function VehiclesList({ vehicles, onSelectVehicle, onAddVehicle }: VehiclesListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('In Repair');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date-newest');

  const sortedVehicles = [...vehicles].sort((a, b) => 
    new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  );

  // Filter by status
  const statusFilteredVehicles = filterStatus === 'All' 
    ? sortedVehicles 
    : sortedVehicles.filter(vehicle => vehicle.status === filterStatus);

  // Filter by search query
  const filteredVehicles = searchQuery.trim() === ''
    ? statusFilteredVehicles
    : statusFilteredVehicles.filter(vehicle => {
        const query = searchQuery.toLowerCase();
        return (
          vehicle.vin.toLowerCase().includes(query) ||
          vehicle.make.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.year.toString().includes(query) ||
          (vehicle.name && vehicle.name.toLowerCase().includes(query)) ||
          `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(query)
        );
      });

  const statuses = ['All', 'In Repair', 'Completed', 'Sold'];

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-1">Vehicles</h1>
            <p className="text-sm text-muted-foreground">
              {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} in inventory
            </p>
          </div>
          <div className="flex items-center gap-2">
            {vehicles.length > 0 && (
              <button
                onClick={() => exportVehiclesToCSV(vehicles)}
                className="btn-secondary flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Export</span>
              </button>
            )}
            <button
              onClick={onAddVehicle}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {vehicles.length > 0 && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by VIN, make, model, or year..."
                className="input pl-12 pr-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                {filteredVehicles.length} result{filteredVehicles.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        )}

        {/* Filter Section */}
        {vehicles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by Status</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    filterStatus === status
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary hover:bg-accent'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sort Section - Compact */}
        {vehicles.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0 text-muted-foreground">
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-sm font-medium">Sort by</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            >
              <option value="date-newest">Date (Newest First)</option>
              <option value="date-oldest">Date (Oldest First)</option>
              <option value="profit-high">Profit (Highest First)</option>
              <option value="profit-low">Profit (Lowest First)</option>
              <option value="investment-high">Investment (Highest First)</option>
              <option value="investment-low">Investment (Lowest First)</option>
            </select>
          </div>
        )}

        {/* Empty States */}
        {vehicles.length === 0 ? (
          <div className="card p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Car className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium mb-1">No vehicles yet</p>
              <p className="text-sm text-muted-foreground">Add your first vehicle to get started</p>
            </div>
            <button
              onClick={onAddVehicle}
              className="btn-primary mx-auto"
            >
              Add Your First Vehicle
            </button>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="card p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium mb-1">No results found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try a different search term' : `No vehicles with status "${filterStatus}"`}
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('All');
              }}
              className="btn-secondary mx-auto"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Vehicle Cards */}
            {filteredVehicles
              .sort((a, b) => {
                switch (sortBy) {
                  case 'date-newest':
                    return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
                  case 'date-oldest':
                    return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
                  case 'profit-high':
                    return calculateProfit(b) - calculateProfit(a);
                  case 'profit-low':
                    return calculateProfit(a) - calculateProfit(b);
                  case 'investment-high':
                    return calculateTotalInvestment(b) - calculateTotalInvestment(a);
                  case 'investment-low':
                    return calculateTotalInvestment(a) - calculateTotalInvestment(b);
                  default:
                    return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
                }
              })
              .map((vehicle) => {
                const profit = calculateProfit(vehicle);
                const roi = calculateROI(vehicle);
                
                // Registration expiry check
                const registrationExpired = isRegistrationExpired(vehicle.registrationExpiryDate);
                const daysRemaining = getRegistrationDaysRemaining(vehicle.registrationExpiryDate);
                const registrationExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;
                
                // Profit Alert Logic
                let profitIndicator = null;
                if (profit < 0) {
                  profitIndicator = { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Loss' };
                } else if (roi < 15) {
                  profitIndicator = { icon: TrendingDown, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Low ROI' };
                } else if (roi >= 30) {
                  profitIndicator = { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', label: 'High ROI' };
                }

                return (
                <button
                  key={vehicle.id}
                  onClick={() => onSelectVehicle(vehicle.id)}
                  className="w-full card card-hover p-5 text-left relative group"
                >
                  {/* Profit Alert Badge */}
                  {profitIndicator && (
                    <div className={`absolute top-4 right-4 ${profitIndicator.bg} ${profitIndicator.color} px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-sm`}>
                      <profitIndicator.icon className="w-3.5 h-3.5" />
                      <span>{profitIndicator.label}</span>
                    </div>
                  )}

                  <div className="flex gap-4 mb-4">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-24 h-24 object-cover rounded-xl flex-shrink-0 ring-1 ring-border"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-border">
                        <Car className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 pr-16">
                      {vehicle.name && (
                        <div className="text-sm text-primary font-medium mb-1">{vehicle.name}</div>
                      )}
                      <div className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">VIN: {vehicle.vin}</div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-2 self-center transition-colors" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Investment</div>
                      <div className="text-lg font-semibold text-primary">{formatCurrency(calculateTotalInvestment(vehicle))}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Profit • {roi.toFixed(1)}% ROI</div>
                      <div className={`text-lg font-semibold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(profit)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`badge ${
                      vehicle.status === 'In Repair' ? 'badge-in-repair' :
                      vehicle.status === 'Completed' ? 'badge-completed' :
                      'badge-sold'
                    }`}>
                      {vehicle.status}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {new Date(vehicle.purchaseDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Registration Expiry Warning */}
                  {registrationExpired && (
                    <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2.5 rounded-xl flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">Registration Expired!</span>
                    </div>
                  )}
                  {registrationExpiringSoon && !registrationExpired && (
                    <div className="mt-4 bg-warning/10 border border-warning/20 text-warning-foreground px-3 py-2.5 rounded-xl flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}