import { supabase } from './client';
import { Vehicle, Cost } from '../types';

// ============================================
// VEHICLES
// ============================================

// Get all vehicles for current user
export async function getVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      costs (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }

  // Transform database format to app format
  return data.map(vehicle => ({
    id: vehicle.id,
    name: vehicle.name || undefined,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    vin: vehicle.vin,
    color: vehicle.color || undefined,
    bodyType: vehicle.body_type || undefined,
    odometer: vehicle.odometer,
    auction: vehicle.auction,
    purchaseDate: vehicle.purchase_date,
    purchasePrice: vehicle.purchase_price,
    transportCost: vehicle.transport_cost,
    estimatedSalePrice: vehicle.estimated_sale_price,
    actualSalePrice: vehicle.actual_sale_price || undefined,
    status: vehicle.status as any,
    damageCondition: vehicle.damage_condition || undefined,
    registrationNumber: vehicle.registration_number || undefined,
    registrationExpiryDate: vehicle.registration_expiry_date || undefined,
    images: vehicle.images || [],
    completionPhoto: vehicle.completion_photo || undefined,
    costs: vehicle.costs || [],
    activityLog: [], // TODO: Fetch from activity_logs table
  }));
}

// Get single vehicle by ID
export async function getVehicle(vehicleId: string): Promise<Vehicle | null> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      costs (*)
    `)
    .eq('id', vehicleId)
    .single();

  if (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name || undefined,
    make: data.make,
    model: data.model,
    year: data.year,
    vin: data.vin,
    color: data.color || undefined,
    bodyType: data.body_type || undefined,
    odometer: data.odometer,
    auction: data.auction,
    purchaseDate: data.purchase_date,
    purchasePrice: data.purchase_price,
    transportCost: data.transport_cost,
    estimatedSalePrice: data.estimated_sale_price,
    actualSalePrice: data.actual_sale_price || undefined,
    status: data.status as any,
    damageCondition: data.damage_condition || undefined,
    registrationNumber: data.registration_number || undefined,
    registrationExpiryDate: data.registration_expiry_date || undefined,
    images: data.images || [],
    completionPhoto: data.completion_photo || undefined,
    costs: data.costs || [],
    activityLog: [], // TODO: Fetch from activity_logs table
  };
}

// Create new vehicle
export async function createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      user_id: user.id,
      name: vehicle.name || null,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      color: vehicle.color || null,
      body_type: vehicle.bodyType || null,
      odometer: vehicle.odometer,
      auction: vehicle.auction,
      purchase_date: vehicle.purchaseDate,
      purchase_price: vehicle.purchasePrice,
      transport_cost: vehicle.transportCost,
      estimated_sale_price: vehicle.estimatedSalePrice,
      actual_sale_price: vehicle.actualSalePrice || null,
      status: vehicle.status,
      damage_condition: vehicle.damageCondition || null,
      registration_number: vehicle.registrationNumber || null,
      registration_expiry_date: vehicle.registrationExpiryDate || null,
      images: vehicle.images || [],
      completion_photo: vehicle.completionPhoto || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }

  // Create costs if any
  if (vehicle.costs && vehicle.costs.length > 0) {
    await createCosts(data.id, vehicle.costs);
  }

  // Create activity log
  if (vehicle.activityLog && vehicle.activityLog.length > 0) {
    await createActivityLogs(data.id, vehicle.activityLog);
  }

  return await getVehicle(data.id) as Vehicle;
}

// Update vehicle
export async function updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicles')
    .update({
      name: updates.name || null,
      make: updates.make,
      model: updates.model,
      year: updates.year,
      vin: updates.vin,
      color: updates.color || null,
      body_type: updates.bodyType || null,
      odometer: updates.odometer,
      auction: updates.auction,
      purchase_date: updates.purchaseDate,
      purchase_price: updates.purchasePrice,
      transport_cost: updates.transportCost,
      estimated_sale_price: updates.estimatedSalePrice,
      actual_sale_price: updates.actualSalePrice || null,
      status: updates.status,
      damage_condition: updates.damageCondition || null,
      registration_number: updates.registrationNumber || null,
      registration_expiry_date: updates.registrationExpiryDate || null,
      images: updates.images || [],
      completion_photo: updates.completionPhoto || null,
    })
    .eq('id', vehicleId)
    .select()
    .single();

  if (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }

  return await getVehicle(vehicleId) as Vehicle;
}

// Delete vehicle
export async function deleteVehicle(vehicleId: string): Promise<void> {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', vehicleId);

  if (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}

// ============================================
// COSTS
// ============================================

// Create costs for a vehicle
export async function createCosts(vehicleId: string, costs: Cost[]): Promise<void> {
  const costsData = costs.map(cost => ({
    vehicle_id: vehicleId,
    category: cost.category,
    description: cost.description,
    supplier: cost.supplier || null,
    invoice_number: cost.invoiceNumber || null,
    date: cost.date,
    amount: cost.amount,
  }));

  const { error } = await supabase
    .from('costs')
    .insert(costsData);

  if (error) {
    console.error('Error creating costs:', error);
    throw error;
  }
}

// Create a single cost and return the inserted row (mapped to app Cost shape)
export async function createCost(vehicleId: string, cost: Cost): Promise<Cost> {
  const costData = {
    vehicle_id: vehicleId,
    category: cost.category,
    description: cost.description,
    supplier: cost.supplier || null,
    invoice_number: cost.invoiceNumber || null,
    date: cost.date,
    amount: cost.amount,
  } as any;

  const { data, error } = await supabase
    .from('costs')
    .insert(costData)
    .select()
    .single();

  if (error) {
    console.error('Error creating cost:', error);
    throw error;
  }

  // Map DB row to app Cost type
  return {
    id: data.id,
    category: data.category,
    description: data.description,
    supplier: data.supplier || undefined,
    invoiceNumber: data.invoice_number || undefined,
    date: data.date,
    amount: data.amount,
  } as Cost;
}

// Update cost
export async function updateCost(costId: string, updates: Partial<Cost>): Promise<void> {
  const { error } = await supabase
    .from('costs')
    .update({
      category: updates.category,
      description: updates.description,
      supplier: updates.supplier || null,
      invoice_number: updates.invoiceNumber || null,
      date: updates.date,
      amount: updates.amount,
    })
    .eq('id', costId);

  if (error) {
    console.error('Error updating cost:', error);
    throw error;
  }
}

// Delete cost
export async function deleteCost(costId: string): Promise<void> {
  const { error } = await supabase
    .from('costs')
    .delete()
    .eq('id', costId);

  if (error) {
    console.error('Error deleting cost:', error);
    throw error;
  }
}

// ============================================
// ACTIVITY LOGS
// ============================================

// Create activity logs for a vehicle
export async function createActivityLogs(vehicleId: string, logs: any[]): Promise<void> {
  const logsData = logs.map(log => ({
    vehicle_id: vehicleId,
    type: log.type,
    description: log.description,
    details: log.details || null,
  }));

  const { error } = await supabase
    .from('activity_logs')
    .insert(logsData);

  if (error) {
    console.error('Error creating activity logs:', error);
    throw error;
  }
}

// Create single activity log
export async function createActivityLog(vehicleId: string, log: {
  type: string;
  description: string;
  details?: string;
}): Promise<void> {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      vehicle_id: vehicleId,
      type: log.type,
      description: log.description,
      details: log.details || null,
    });

  if (error) {
    console.error('Error creating activity log:', error);
    throw error;
  }
}

// ============================================
// STORAGE (Images)
// ============================================

// Upload vehicle image
export async function uploadVehicleImage(vehicleId: string, file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${vehicleId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('vehicle-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('vehicle-images')
    .getPublicUrl(data.path);

  return publicUrl;
}

// Delete vehicle image
export async function deleteVehicleImage(imagePath: string): Promise<void> {
  // Extract path from URL
  const path = imagePath.split('/vehicle-images/')[1];
  
  if (!path) return;

  const { error } = await supabase.storage
    .from('vehicle-images')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
