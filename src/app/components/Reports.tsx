import { Vehicle } from '../types';
import { calculateTotalInvestment, calculateProfit, calculateDashboardStats, formatCurrency } from '../utils/calculations';
import { exportVehiclesToCSV } from '../utils/csvExport';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileDown, TrendingUp, DollarSign } from 'lucide-react';

interface ReportsProps {
  vehicles: Vehicle[];
}

export function Reports({ vehicles }: ReportsProps) {
  const stats = calculateDashboardStats(vehicles);

  // Prepare chart data
  const vehicleChartData = vehicles.map(v => ({
    name: `${v.year} ${v.make} ${v.model}`.substring(0, 15),
    investment: calculateTotalInvestment(v),
    profit: calculateProfit(v),
  })).slice(0, 10);

  const statusData = Object.entries(stats.statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  })).filter(d => d.value > 0);

  const statusColors: Record<string, string> = {
    'In Repair': '#3b82f6',
    'Completed': '#ea580c',
    'Sold': '#10b981',
  };

  const handleExportPDF = () => {
    // In a real app, this would generate and download a PDF
    alert('PDF export would be generated here. This feature requires a backend service or PDF library.');
  };

  const handleExportCSV = () => {
    exportVehiclesToCSV(vehicles);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl">Reports</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl transition-colors text-sm"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl transition-colors text-sm"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 border border-border text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No data to display</p>
            <p className="text-muted-foreground text-sm mt-2">Add vehicles to see reports</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-card rounded-2xl p-5 border border-border">
                <div className="text-sm text-muted-foreground mb-2">Total Investment</div>
                <div className="text-3xl text-blue-600">{formatCurrency(stats.totalInvested)}</div>
              </div>
              <div className="bg-card rounded-2xl p-5 border border-border">
                <div className="text-sm text-muted-foreground mb-2">Total Profit</div>
                <div className={`text-3xl ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.totalProfit)}
                </div>
              </div>
            </div>

            {/* Profit by Vehicle Chart */}
            {vehicleChartData.length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border mb-8">
                <h2 className="text-xl mb-4">Profit by Vehicle</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehicleChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        color: '#111827',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Status Distribution */}
            {statusData.length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border mb-8">
                <h2 className="text-xl mb-4">Status Distribution</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        color: '#111827',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Vehicle Performance Table */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl mb-4">Vehicle Performance</h2>
              <div className="space-y-3">
                {vehicles.map((vehicle) => {
                  const investment = calculateTotalInvestment(vehicle);
                  const profit = calculateProfit(vehicle);
                  const profitMargin = investment > 0 ? (profit / investment) * 100 : 0;

                  return (
                    <div
                      key={vehicle.id}
                      className="bg-muted/50 rounded-xl p-4 border border-border"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="mb-1">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-xs text-muted-foreground">{vehicle.vin}</div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          vehicle.status === 'Sold' ? 'bg-emerald-100 text-emerald-700' :
                          vehicle.status === 'Completed' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {vehicle.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground text-xs mb-1">Investment</div>
                          <div className="text-blue-600">{formatCurrency(investment)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs mb-1">Profit</div>
                          <div className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(profit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs mb-1">Margin</div>
                          <div className={profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {profitMargin.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}