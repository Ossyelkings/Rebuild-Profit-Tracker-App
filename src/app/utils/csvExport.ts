import { Vehicle } from '../types';
import { calculateTotalInvestment, calculateProfit, calculateROI, calculateTotalCosts } from './calculations';

export function exportVehiclesToCSV(vehicles: Vehicle[]) {
  // CSV Headers
  const headers = [
    'VIN',
    'Name',
    'Year',
    'Make',
    'Model',
    'Odometer (km)',
    'Auction',
    'Purchase Date',
    'Status',
    'Purchase Price',
    'Transport Cost',
    'Repair Costs',
    'Total Investment',
    'Estimated Sale Price',
    'Actual Sale Price',
    'Sold Date',
    'Profit',
    'ROI %',
    'Number of Costs'
  ];

  // Convert vehicles to CSV rows
  const rows = vehicles.map(vehicle => {
    const totalCosts = calculateTotalCosts(vehicle);
    const investment = calculateTotalInvestment(vehicle);
    const profit = calculateProfit(vehicle);
    const roi = calculateROI(vehicle);

    return [
      vehicle.vin,
      vehicle.name || '',
      vehicle.year,
      vehicle.make,
      vehicle.model,
      vehicle.odometer,
      vehicle.auction,
      vehicle.purchaseDate,
      vehicle.status,
      vehicle.purchasePrice.toFixed(2),
      vehicle.transportCost.toFixed(2),
      totalCosts.toFixed(2),
      investment.toFixed(2),
      vehicle.estimatedSalePrice.toFixed(2),
      vehicle.actualSalePrice?.toFixed(2) || '',
      vehicle.soldDate || '',
      profit.toFixed(2),
      roi.toFixed(2),
      vehicle.costs.length
    ];
  });

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `vehicles_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportVehicleDetailToCSV(vehicle: Vehicle) {
  // Main vehicle info
  const vehicleHeaders = ['Field', 'Value'];
  const totalCosts = calculateTotalCosts(vehicle);
  const investment = calculateTotalInvestment(vehicle);
  const profit = calculateProfit(vehicle);
  const roi = calculateROI(vehicle);

  const vehicleRows = [
    ['VIN', vehicle.vin],
    ['Name', vehicle.name || ''],
    ['Year', vehicle.year],
    ['Make', vehicle.make],
    ['Model', vehicle.model],
    ['Odometer (km)', vehicle.odometer],
    ['Auction', vehicle.auction],
    ['Purchase Date', vehicle.purchaseDate],
    ['Status', vehicle.status],
    ['Purchase Price', `$${vehicle.purchasePrice.toFixed(2)}`],
    ['Transport Cost', `$${vehicle.transportCost.toFixed(2)}`],
    ['Repair Costs', `$${totalCosts.toFixed(2)}`],
    ['Total Investment', `$${investment.toFixed(2)}`],
    ['Estimated Sale Price', `$${vehicle.estimatedSalePrice.toFixed(2)}`],
    ['Actual Sale Price', vehicle.actualSalePrice ? `$${vehicle.actualSalePrice.toFixed(2)}` : ''],
    ['Sold Date', vehicle.soldDate || ''],
    ['Profit', `$${profit.toFixed(2)}`],
    ['ROI %', `${roi.toFixed(2)}%`]
  ];

  // Costs breakdown
  const costsHeaders = ['Category', 'Description', 'Supplier', 'Invoice #', 'Date', 'Amount'];
  const costsRows = vehicle.costs.map(cost => [
    cost.category,
    cost.description,
    cost.supplier,
    cost.invoiceNumber,
    cost.date,
    `$${cost.amount.toFixed(2)}`
  ]);

  // Combine all sections
  const csvContent = [
    '=== VEHICLE INFORMATION ===',
    vehicleHeaders.join(','),
    ...vehicleRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    '',
    '=== COST BREAKDOWN ===',
    costsHeaders.join(','),
    ...costsRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${vehicle.year}_${vehicle.make}_${vehicle.model}_${vehicle.vin}_export.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
