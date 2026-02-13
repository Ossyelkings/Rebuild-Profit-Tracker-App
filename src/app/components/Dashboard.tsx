import { Vehicle } from '../types';
import { calculateDashboardStats, formatCurrency } from '../utils/calculations';
import { TrendingUp, Car, DollarSign, PiggyBank, Wrench, CheckCircle2, Sun, Moon, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  vehicles: Vehicle[];
  onNavigate: (tab: string, vehicleId?: string) => void;
}

export function Dashboard({ vehicles, onNavigate }: DashboardProps) {
  const stats = calculateDashboardStats(vehicles);
  const { theme, toggleTheme } = useTheme();
  
  const statusColors: Record<string, string> = {
    'In Repair': 'text-status-in-repair',
    'Completed': 'text-status-completed',
    'Sold': 'text-status-sold',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    'In Repair': <Wrench className="w-4 h-4" />,
    'Completed': <CheckCircle2 className="w-4 h-4" />,
    'Sold': <DollarSign className="w-4 h-4" />,
  };

  const recentVehicles = [...vehicles]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="p-6 space-y-6">
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-1">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Track your vehicle inventory and profits</p>
          </div>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn-ghost h-10 w-10 p-0 flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600" />
            )}
          </button>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-2 rounded-lg bg-muted">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide">Vehicles</span>
            </div>
            <div className="text-2xl font-semibold">{stats.totalVehicles}</div>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-2 rounded-lg bg-muted">
                <PiggyBank className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide">Invested</span>
            </div>
            <div className="text-2xl font-semibold text-primary">{formatCurrency(stats.totalInvested)}</div>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-2 rounded-lg bg-muted">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide">Revenue</span>
            </div>
            <div className="text-2xl font-semibold text-success">{formatCurrency(stats.projectedRevenue)}</div>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-2 rounded-lg bg-muted">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide">Profit</span>
            </div>
            <div className={`text-2xl font-semibold ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(stats.totalProfit)}
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Status Overview</h2>
          <div className="space-y-3">
            {Object.entries(stats.statusCounts)
              .filter(([status]) => statusColors[status])
              .map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${status === 'In Repair' ? 'bg-status-in-repair-bg' : status === 'Completed' ? 'bg-status-completed-bg' : 'bg-status-sold-bg'} ${statusColors[status]}`}>
                    {statusIcons[status]}
                  </div>
                  <span className="font-medium">{status}</span>
                </div>
                <span className={`text-xl font-semibold ${statusColors[status]}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Vehicles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Vehicles</h2>
            {vehicles.length > 0 && (
              <button
                onClick={() => onNavigate('vehicles')}
                className="btn-ghost text-primary flex items-center gap-1 text-sm"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          
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
                onClick={() => onNavigate('add')}
                className="btn-primary mx-auto"
              >
                Add Your First Vehicle
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => onNavigate('vehicles', vehicle.id)}
                  className="w-full card card-hover p-4 text-left group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        VIN: {vehicle.vin}
                      </div>
                    </div>
                    <span className={`badge ${
                      vehicle.status === 'In Repair' ? 'badge-in-repair' :
                      vehicle.status === 'Completed' ? 'badge-completed' :
                      'badge-sold'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Invested:</span>
                      <span className="ml-2 font-medium">{formatCurrency(vehicle.purchasePrice + vehicle.transportCost)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. Sale:</span>
                      <span className="ml-2 font-medium text-success">{formatCurrency(vehicle.estimatedSalePrice)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}