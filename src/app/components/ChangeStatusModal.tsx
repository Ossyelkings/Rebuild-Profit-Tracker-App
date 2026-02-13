import { useState } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { Camera, X } from 'lucide-react';

interface ChangeStatusModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

export function ChangeStatusModal({ vehicle, onClose, onSave }: ChangeStatusModalProps) {
  const [formData, setFormData] = useState({
    status: vehicle.status,
    actualSalePrice: vehicle.actualSalePrice?.toString() || '',
    soldDate: vehicle.soldDate || new Date().toISOString().split('T')[0],
    registrationNumber: vehicle.registrationNumber || '',
    registrationExpiryDate: vehicle.registrationExpiryDate || '',
  });

  const [completionPhoto, setCompletionPhoto] = useState<string | undefined>(vehicle.completionPhoto);

  const statuses: VehicleStatus[] = [
    'In Repair',
    'Completed',
    'Sold',
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setCompletionPhoto(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedVehicle: Vehicle = {
      ...vehicle,
      status: formData.status,
    };

    // If status is "Sold", add the actual sale price and sold date
    if (formData.status === 'Sold') {
      updatedVehicle.actualSalePrice = parseFloat(formData.actualSalePrice) || 0;
      updatedVehicle.soldDate = formData.soldDate;
    } else {
      // Clear actual sale price if status is changed from Sold to something else
      updatedVehicle.actualSalePrice = undefined;
      updatedVehicle.soldDate = undefined;
    }

    // If status is "Completed", add the registration details and optional completion photo
    if (formData.status === 'Completed') {
      updatedVehicle.registrationNumber = formData.registrationNumber;
      updatedVehicle.registrationExpiryDate = formData.registrationExpiryDate;
      updatedVehicle.completionPhoto = completionPhoto;
    } else {
      // Clear registration details and completion photo if status is changed from Completed to something else
      updatedVehicle.registrationNumber = undefined;
      updatedVehicle.registrationExpiryDate = undefined;
      updatedVehicle.completionPhoto = undefined;
    }

    onSave(updatedVehicle);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
      <div className="bg-card rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Change Vehicle Status</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Show sale price and date inputs only if status is "Sold" */}
            {formData.status === 'Sold' && (
              <>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Actual Sale Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.actualSalePrice}
                    onChange={(e) => setFormData({ ...formData, actualSalePrice: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="25000.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Sold Date *</label>
                  <input
                    type="date"
                    value={formData.soldDate}
                    onChange={(e) => setFormData({ ...formData, soldDate: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </>
            )}

            {/* Show registration fields only if status is "Completed" */}
            {formData.status === 'Completed' && (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm">
                  <p className="text-blue-800 dark:text-blue-200">
                    Optionally enter the vehicle's registration details to track expiry and receive reminders.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Registration Number</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 uppercase"
                    placeholder="ABC123"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Registration Expiry Date</label>
                  <input
                    type="date"
                    value={formData.registrationExpiryDate}
                    onChange={(e) => setFormData({ ...formData, registrationExpiryDate: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Completion Photo Upload */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Completion Photo (Optional)
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add a photo of the completed vehicle to showcase the finished work
                  </p>
                  
                  {!completionPhoto ? (
                    <label
                      htmlFor="completionPhotoInput"
                      className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl cursor-pointer transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Take/Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="completionPhotoInput"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-blue-500">
                      <img
                        src={completionPhoto}
                        alt="Completion photo"
                        className="w-full h-auto"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

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
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}