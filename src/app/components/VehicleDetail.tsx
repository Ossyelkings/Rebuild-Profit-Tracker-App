import { Vehicle, Cost, VehicleStatus, CostCategory } from '../types';
import { calculateTotalInvestment, calculateProfit, calculateROI, calculateTotalCosts, formatCurrency, isRegistrationExpired, getRegistrationDaysRemaining } from '../utils/calculations';
import { ArrowLeft, DollarSign, TrendingUp, Plus, Edit2, Trash2, Receipt, Camera, X, Download, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChangeStatusModal } from './ChangeStatusModal';
import { PhotoGallery } from './PhotoGallery';
import { VehicleTimeline } from './VehicleTimeline';
import { ActivityLog } from './ActivityLog';
import { RepairDuration } from './RepairDuration';

interface VehicleDetailProps {
  vehicle: Vehicle;
  onBack: () => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
}

export function VehicleDetail({ vehicle, onBack, onUpdateVehicle, onDeleteVehicle }: VehicleDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  const [deletingCostId, setDeletingCostId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const investment = calculateTotalInvestment(vehicle);
  const profit = calculateProfit(vehicle);
  const roi = calculateROI(vehicle);
  const totalCosts = calculateTotalCosts(vehicle);

  const handleDeleteCost = (costId: string) => {
    const updatedVehicle = {
      ...vehicle,
      costs: vehicle.costs.filter(c => c.id !== costId)
    };
    onUpdateVehicle(updatedVehicle);
  };

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            onUpdateVehicle({
              ...vehicle,
              images: [...vehicle.images, ...newImages]
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImageUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setImages(newImages);
  };

  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setImages(newImages);
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return; // Already primary
    const newImages = [...images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setImages(newImages);
  };

  const handleDownloadVehicleInfo = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Header Section
    doc.setFillColor(37, 99, 235); // Blue background
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('REBUILD PROFIT TRACKER', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Vehicle Profit & Investment Report', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 33, { align: 'center' });
    
    let yPos = 50;
    
    // Vehicle Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    doc.text(vehicleTitle, 14, yPos);
    yPos += 10;
    
    if (vehicle.name) {
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'normal');
      doc.text(vehicle.name, 14, yPos);
      yPos += 8;
    }
    
    yPos += 2;
    
    // Vehicle Information Table
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('VEHICLE INFORMATION', 14, yPos);
    yPos += 3;
    
    // Split into two tables side by side
    const leftTableData = [
      ['VIN', vehicle.vin],
      ['Make', vehicle.make],
      ['Model', vehicle.model],
      ['Year', vehicle.year.toString()],
      ['Color', vehicle.color || 'Not specified'],
    ];
    
    const rightTableData = [
      ['Body Type', vehicle.bodyType || 'Not specified'],
      ['Odometer', `${vehicle.odometer.toLocaleString()} km`],
      ['Auction', vehicle.auction],
      ['Purchase Date', new Date(vehicle.purchaseDate).toLocaleDateString()],
      ['Status', vehicle.status],
    ];
    
    // Left table
    autoTable(doc, {
      startY: yPos,
      head: [['Property', 'Value']],
      body: leftTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold', textColor: [80, 80, 80] },
        1: { cellWidth: 58 },
      },
      margin: { left: 14, right: pageWidth / 2 + 2 },
    });
    
    // Right table (same yPos to align side by side)
    autoTable(doc, {
      startY: yPos,
      head: [['Property', 'Value']],
      body: rightTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold', textColor: [80, 80, 80] },
        1: { cellWidth: 53 },
      },
      margin: { left: pageWidth / 2 + 2, right: 14 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Add damage condition below if it exists
    if (vehicle.damageCondition) {
      const damageTableData = [['Damage Condition', vehicle.damageCondition]];
      
      autoTable(doc, {
        startY: yPos,
        body: damageTableData,
        theme: 'grid',
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold', textColor: [80, 80, 80] },
          1: { cellWidth: 'auto' },
        },
        margin: { left: 14, right: 14 },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Financial Summary Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('FINANCIAL SUMMARY', 14, yPos);
    yPos += 3;
    
    const financialData = [
      ['Purchase Price', formatCurrency(vehicle.purchasePrice)],
      ['Transport Cost', formatCurrency(vehicle.transportCost)],
      ['Repair Costs', formatCurrency(totalCosts)],
      ['Total Investment', formatCurrency(investment)],
      ['Estimated Sale Price', formatCurrency(vehicle.estimatedSalePrice)],
      ['Estimated Profit', formatCurrency(profit)],
      ['ROI', `${roi.toFixed(1)}%`],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Amount']],
      body: financialData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold', textColor: [80, 80, 80] },
        1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: function(data) {
        // Highlight Total Investment row
        if (data.row.index === 3 && data.section === 'body') {
          data.cell.styles.fillColor = [240, 249, 255];
          data.cell.styles.textColor = [37, 99, 235];
          data.cell.styles.fontSize = 10;
        }
        // Highlight Profit row with color based on positive/negative
        if (data.row.index === 5 && data.section === 'body') {
          if (profit >= 0) {
            data.cell.styles.fillColor = [240, 253, 244];
            data.cell.styles.textColor = [22, 163, 74];
          } else {
            data.cell.styles.fillColor = [254, 242, 242];
            data.cell.styles.textColor = [220, 38, 38];
          }
          data.cell.styles.fontSize = 10;
        }
        // Highlight ROI row
        if (data.row.index === 6 && data.section === 'body') {
          if (roi >= 30) {
            data.cell.styles.fillColor = [240, 253, 244];
            data.cell.styles.textColor = [22, 163, 74];
          } else if (roi < 15) {
            data.cell.styles.fillColor = [254, 242, 242];
            data.cell.styles.textColor = [220, 38, 38];
          }
        }
      },
      margin: { left: 14, right: 14 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Cost Breakdown Table (if costs exist)
    if (vehicle.costs.length > 0) {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('COST BREAKDOWN', 14, yPos);
      yPos += 3;
      
      const costData = vehicle.costs.map(cost => [
        cost.category,
        cost.description,
        cost.supplier,
        cost.invoiceNumber,
        new Date(cost.date).toLocaleDateString(),
        formatCurrency(cost.amount),
      ]);
      
      // Add total row
      costData.push([
        { content: 'TOTAL REPAIR COSTS', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
        formatCurrency(totalCosts),
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Description', 'Supplier', 'Invoice #', 'Date', 'Amount']],
        body: costData,
        theme: 'grid',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left',
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 45 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: function(data) {
          // Highlight the total row
          if (data.row.index === vehicle.costs.length && data.section === 'body') {
            data.cell.styles.fillColor = [37, 99, 235];
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontSize = 9;
            data.cell.styles.fontStyle = 'bold';
          }
        },
        margin: { left: 14, right: 14 },
      });
    }
    
    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.text('Rebuild Profit Tracker - Professional Vehicle Report', 14, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }
    
    // Save the PDF
    doc.save(`${vehicle.year}_${vehicle.make}_${vehicle.model}_Report.pdf`);
  };

  const handleDownloadVehicleInfoPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('REBUILD PROFIT TRACKER - VEHICLE REPORT', 10, 10);

    // Add vehicle information
    doc.setFontSize(14);
    doc.text('VEHICLE INFORMATION', 10, 20);
    doc.setFontSize(12);
    doc.text(vehicle.name ? `Name: ${vehicle.name}\n` : '', 10, 30);
    doc.text(`Make: ${vehicle.make}`, 10, 40);
    doc.text(`Model: ${vehicle.model}`, 10, 50);
    doc.text(`Year: ${vehicle.year}`, 10, 60);
    doc.text(`VIN: ${vehicle.vin}`, 10, 70);
    doc.text(`Odometer: ${vehicle.odometer.toLocaleString()} km`, 10, 80);
    doc.text(`Auction: ${vehicle.auction}`, 10, 90);
    doc.text(`Purchase Date: ${new Date(vehicle.purchaseDate).toLocaleDateString()}`, 10, 100);
    if (vehicle.color) {
      doc.text(`Color: ${vehicle.color}`, 10, 110);
    }
    if (vehicle.bodyType) {
      doc.text(`Body Type: ${vehicle.bodyType}`, 10, 120);
    }
    if (vehicle.damageCondition) {
      doc.text(`Damage Condition: ${vehicle.damageCondition}`, 10, 130);
    }
    doc.text(`Status: ${vehicle.status}`, 10, 140);

    // Add financial summary
    doc.setFontSize(14);
    doc.text('FINANCIAL SUMMARY', 10, 160);
    doc.setFontSize(12);
    doc.text(`Purchase Price: ${formatCurrency(vehicle.purchasePrice)}`, 10, 170);
    doc.text(`Transport: ${formatCurrency(vehicle.transportCost)}`, 10, 180);
    doc.text(`Repair Costs: ${formatCurrency(totalCosts)}`, 10, 190);
    doc.text(`Total Investment: ${formatCurrency(investment)}`, 10, 200);
    doc.text(`Estimated Sale: ${formatCurrency(vehicle.estimatedSalePrice)}`, 10, 210);
    doc.text(`Estimated Profit: ${formatCurrency(profit)} (ROI: ${roi.toFixed(1)}%)`, 10, 220);

    // Add cost breakdown
    doc.setFontSize(14);
    doc.text('COST BREAKDOWN', 10, 240);
    doc.setFontSize(12);
    vehicle.costs.forEach((cost, index) => {
      const y = 250 + index * 20;
      doc.text(`Category: ${cost.category}`, 10, y);
      doc.text(`Description: ${cost.description}`, 10, y + 5);
      doc.text(`Supplier: ${cost.supplier}`, 10, y + 10);
      doc.text(`Invoice #: ${cost.invoiceNumber}`, 10, y + 15);
      doc.text(`Date: ${new Date(cost.date).toLocaleDateString()}`, 10, y + 20);
      doc.text(`Amount: ${formatCurrency(cost.amount)}`, 10, y + 25);
    });

    // Save PDF
    doc.save(`${vehicle.year}_${vehicle.make}_${vehicle.model}_Vehicle_Report.pdf`);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl flex-1">Vehicle Details</h1>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Images */}
        {vehicle.images && vehicle.images.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">Photos</h2>
              <label className="flex items-center gap-2 bg-muted hover:bg-accent px-3 py-2 rounded-xl cursor-pointer transition-colors">
                <Camera className="w-4 h-4" />
                <span className="text-sm">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddImages}
                  className="hidden"
                />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {vehicle.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`Vehicle ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowImageGallery(true)}
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle Info */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <div className="text-2xl mb-4">
            {vehicle.name && <div className="text-blue-600 mb-2">{vehicle.name}</div>}
            {vehicle.year} {vehicle.make} {vehicle.model}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">VIN</div>
              <div>{vehicle.vin}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Odometer</div>
              <div>{vehicle.odometer.toLocaleString()} km</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Auction</div>
              <div>{vehicle.auction}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Purchase Date</div>
              <div>{new Date(vehicle.purchaseDate).toLocaleDateString()}</div>
            </div>
            {vehicle.color && (
              <div>
                <div className="text-muted-foreground mb-1">Color</div>
                <div>{vehicle.color}</div>
              </div>
            )}
            {vehicle.bodyType && (
              <div>
                <div className="text-muted-foreground mb-1">Body Type</div>
                <div>{vehicle.bodyType}</div>
              </div>
            )}
            {vehicle.damageCondition && (
              <div>
                <div className="text-muted-foreground mb-1">Damage Condition</div>
                <div>{vehicle.damageCondition}</div>
              </div>
            )}
            <div>
              <div className="text-muted-foreground mb-1">Status</div>
              <div className={`inline-block text-xs px-3 py-1 rounded-full ${
                vehicle.status === 'In Repair' ? 'bg-blue-100 text-blue-700' :
                vehicle.status === 'Completed' ? 'bg-orange-100 text-orange-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {vehicle.status}
              </div>
            </div>
          </div>

          {/* Registration Info - Only show if vehicle has registration */}
          {vehicle.registrationNumber && vehicle.registrationExpiryDate && (
            <>
              <div className="border-t border-border mt-4 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Registration #</div>
                    <div className="uppercase font-medium">{vehicle.registrationNumber}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Expiry Date</div>
                    <div>{new Date(vehicle.registrationExpiryDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Registration Expiry Warning */}
              {(() => {
                const expired = isRegistrationExpired(vehicle.registrationExpiryDate);
                const daysRemaining = getRegistrationDaysRemaining(vehicle.registrationExpiryDate);
                const expiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;

                if (expired) {
                  return (
                    <div className="mt-4 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Registration Expired!</div>
                        <div className="text-sm mt-1">This vehicle's registration has expired. Please renew immediately.</div>
                      </div>
                    </div>
                  );
                } else if (expiringSoon) {
                  return (
                    <div className="mt-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Registration Expiring Soon</div>
                        <div className="text-sm mt-1">Registration expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.</div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </>
          )}

          {/* Completion Photo - Only show if vehicle has completion photo */}
          {vehicle.completionPhoto && (
            <div className="border-t border-border mt-4 pt-4">
              <div className="text-sm text-muted-foreground mb-3">Completion Photo</div>
              <div className="rounded-xl overflow-hidden border-2 border-green-500">
                <img
                  src={vehicle.completionPhoto}
                  alt="Completed vehicle"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <h2 className="text-xl mb-4">Financial Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Purchase Price</span>
              <span className="text-xl">{formatCurrency(vehicle.purchasePrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transport</span>
              <span className="text-xl">{formatCurrency(vehicle.transportCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Repair Costs</span>
              <span className="text-xl">{formatCurrency(totalCosts)}</span>
            </div>
            
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-4">
                <span>Total Investment</span>
                <span className="text-3xl text-blue-600">{formatCurrency(investment)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span>{vehicle.status === 'Sold' ? 'Actual Sale' : 'Estimated Sale'}</span>
                <span className="text-3xl text-emerald-600">{formatCurrency(vehicle.status === 'Sold' && vehicle.actualSalePrice ? vehicle.actualSalePrice : vehicle.estimatedSalePrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="mb-1">{vehicle.status === 'Sold' ? 'Actual Profit' : 'Estimated Profit'}</div>
                  <div className="text-xs text-muted-foreground">ROI: {roi.toFixed(1)}%</div>
                </div>
                <span className={`text-4xl ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Costs Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Cost Breakdown</h2>
            <button
              onClick={() => setIsAddingCost(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Cost
            </button>
          </div>

          {vehicle.costs.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 border border-border text-center">
              <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No costs added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicle.costs.map((cost) => (
                <div
                  key={cost.id}
                  className="bg-card rounded-xl p-4 border border-border"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                          {cost.category}
                        </span>
                      </div>
                      <div className="mb-1">{cost.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {cost.supplier} • {cost.invoiceNumber}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <div className="text-xl text-blue-600">{formatCurrency(cost.amount)}</div>
                        <div className="text-xs text-muted-foreground">{new Date(cost.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button
                      onClick={() => setEditingCost(cost)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600/10 hover:bg-green-600/20 text-green-600 rounded-lg transition-colors text-sm border border-green-600/30"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingCostId(cost.id)}
                      className="p-1.5 hover:bg-red-600/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Timeline */}
        <div className="mb-6">
          <VehicleTimeline vehicle={vehicle} />
        </div>

        {/* Repair Duration */}
        <div className="mb-6">
          <RepairDuration vehicle={vehicle} />
        </div>

        {/* Activity Log */}
        <div className="mb-6">
          <ActivityLog activityLog={vehicle.activityLog || []} />
        </div>

        {/* Download Vehicle Report Button */}
        <button
          onClick={handleDownloadVehicleInfo}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
        >
          <Download className="w-5 h-5" />
          Download Vehicle Report (PDF)
        </button>

        {/* Change Status Button */}
        <button
          onClick={() => setShowStatusModal(true)}
          className="w-full bg-muted hover:bg-accent text-foreground py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 className="w-5 h-5" />
          Change Vehicle Status
        </button>
      </div>

      {/* Add Cost Modal */}
      {isAddingCost && (
        <AddCostModal
          vehicle={vehicle}
          onClose={() => setIsAddingCost(false)}
          onSave={(cost) => {
            const updatedVehicle = {
              ...vehicle,
              costs: [...vehicle.costs, cost]
            };
            onUpdateVehicle(updatedVehicle);
            setIsAddingCost(false);
          }}
        />
      )}

      {/* Edit Vehicle Modal */}
      {isEditing && (
        <EditVehicleModal
          vehicle={vehicle}
          onClose={() => setIsEditing(false)}
          onSave={(updatedVehicle) => {
            onUpdateVehicle(updatedVehicle);
            setIsEditing(false);
          }}
        />
      )}

      {/* Edit Cost Modal */}
      {editingCost && (
        <EditCostModal
          cost={editingCost}
          onClose={() => setEditingCost(null)}
          onSave={(updatedCost) => {
            const updatedVehicle = {
              ...vehicle,
              costs: vehicle.costs.map(c => c.id === updatedCost.id ? updatedCost : c)
            };
            onUpdateVehicle(updatedVehicle);
            setEditingCost(null);
          }}
        />
      )}

      {/* Change Status Modal */}
      {showStatusModal && (
        <ChangeStatusModal
          vehicle={vehicle}
          onClose={() => setShowStatusModal(false)}
          onSave={(updatedVehicle) => {
            onUpdateVehicle(updatedVehicle);
            setShowStatusModal(false);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-zinc-800">
            <h3 className="text-xl mb-3">Delete Vehicle?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              This action cannot be undone. All cost data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteVehicle(vehicle.id);
                  onBack();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Cost Confirmation */}
      {deletingCostId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border">
            <h3 className="text-xl mb-3">Delete Cost?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete this cost entry? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingCostId(null)}
                className="flex-1 bg-muted hover:bg-accent py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteCost(deletingCostId);
                  setDeletingCostId(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery */}
      {showImageGallery && vehicle.images.length > 0 && (
        <PhotoGallery
          images={vehicle.images}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </div>
  );
}

// Add Cost Modal Component
function AddCostModal({ vehicle, onClose, onSave }: {
  vehicle: Vehicle;
  onClose: () => void;
  onSave: (cost: Cost) => void;
}) {
  const [formData, setFormData] = useState({
    category: 'Parts' as CostCategory,
    description: '',
    supplier: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
  });

  const categories: CostCategory[] = [
    'Parts',
    'Labour',
    'Mechanical',
    'Paint & Body',
    'Inspection',
    'Registration',
    'Transport',
    'Miscellaneous',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCost: Cost = {
      id: Date.now().toString(),
      category: formData.category,
      description: formData.description,
      supplier: formData.supplier,
      invoiceNumber: formData.invoiceNumber,
      date: formData.date,
      amount: parseFloat(formData.amount) || 0,
    };
    onSave(newCost);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
      <div className="bg-card rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Add Cost</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CostCategory })}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Front bumper replacement"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="Supplier name"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Invoice #</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="INV-001"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-muted hover:bg-accent py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors"
              >
                Add Cost
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Vehicle Modal Component
function EditVehicleModal({ vehicle, onClose, onSave }: {
  vehicle: Vehicle;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}) {
  const [formData, setFormData] = useState({
    name: vehicle.name || '',
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year.toString(),
    vin: vehicle.vin,
    odometer: vehicle.odometer.toString(),
    auction: vehicle.auction,
    purchaseDate: vehicle.purchaseDate,
    purchasePrice: vehicle.purchasePrice.toString(),
    transportCost: vehicle.transportCost.toString(),
    estimatedSalePrice: vehicle.estimatedSalePrice.toString(),
  });

  const [images, setImages] = useState<string[]>(vehicle.images || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedVehicle: Vehicle = {
      ...vehicle,
      name: formData.name,
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year),
      vin: formData.vin,
      odometer: parseInt(formData.odometer),
      auction: formData.auction,
      purchaseDate: formData.purchaseDate,
      purchasePrice: parseFloat(formData.purchasePrice),
      transportCost: parseFloat(formData.transportCost),
      estimatedSalePrice: parseFloat(formData.estimatedSalePrice),
      images: images,
    };
    onSave(updatedVehicle);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImageUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setImages(newImages);
  };

  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setImages(newImages);
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return; // Already primary
    const newImages = [...images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setImages(newImages);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
      <div className="bg-card rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Edit Vehicle</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Make</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Odometer (km)</label>
                <input
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">VIN</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Purchase Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Estimated Sale Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedSalePrice}
                  onChange={(e) => setFormData({ ...formData, estimatedSalePrice: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`Vehicle ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => setAsPrimary(index)}
                      className="absolute bottom-1 left-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded transition-colors"
                    >
                      Set as Primary
                    </button>
                  ) : (
                    <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-muted hover:bg-accent py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Cost Modal Component
function EditCostModal({ cost, onClose, onSave }: {
  cost: Cost;
  onClose: () => void;
  onSave: (cost: Cost) => void;
}) {
  const [formData, setFormData] = useState({
    category: cost.category,
    description: cost.description,
    supplier: cost.supplier,
    invoiceNumber: cost.invoiceNumber,
    date: cost.date,
    amount: cost.amount.toString(),
  });

  const categories: CostCategory[] = [
    'Parts',
    'Labour',
    'Mechanical',
    'Paint & Body',
    'Inspection',
    'Registration',
    'Transport',
    'Miscellaneous',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCost: Cost = {
      ...cost,
      category: formData.category,
      description: formData.description,
      supplier: formData.supplier,
      invoiceNumber: formData.invoiceNumber,
      date: formData.date,
      amount: parseFloat(formData.amount) || 0,
    };
    onSave(updatedCost);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
      <div className="bg-card rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Edit Cost</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CostCategory })}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Front bumper replacement"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="Supplier name"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Invoice #</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="INV-001"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-muted hover:bg-accent py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}