import { createVehicle } from '../supabase/database';
import { Vehicle } from '../types';

/**
 * Migrate vehicles from localStorage to Supabase
 * Run this once after user signs in for the first time
 */
export async function migrateLocalStorageToSupabase(): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    // Check if localStorage has vehicles
    const localVehiclesStr = localStorage.getItem('vehicles');
    
    if (!localVehiclesStr) {
      console.log('No local vehicles to migrate');
      return { success: true, migratedCount: 0, errors: [] };
    }

    const localVehicles: Vehicle[] = JSON.parse(localVehiclesStr);

    if (!localVehicles || localVehicles.length === 0) {
      console.log('No local vehicles to migrate');
      return { success: true, migratedCount: 0, errors: [] };
    }

    console.log(`Found ${localVehicles.length} vehicles to migrate`);

    // Migrate each vehicle
    for (const vehicle of localVehicles) {
      try {
        // Remove the old ID since Supabase will generate a new one
        const { id, ...vehicleWithoutId } = vehicle;

        // Create vehicle in Supabase
        await createVehicle(vehicleWithoutId);
        migratedCount++;
        
        console.log(`✅ Migrated: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
      } catch (error) {
        const errorMsg = `Failed to migrate ${vehicle.year} ${vehicle.make} ${vehicle.model}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // If all vehicles migrated successfully, clear localStorage
    if (migratedCount === localVehicles.length) {
      localStorage.removeItem('vehicles');
      localStorage.setItem('migration_completed', 'true');
      console.log('✅ Migration completed! localStorage cleared.');
    } else {
      console.warn(`⚠️ Partial migration: ${migratedCount}/${localVehicles.length} vehicles migrated`);
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors,
    };

  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      migratedCount,
      errors: [`Migration failed: ${error}`],
    };
  }
}

/**
 * Check if migration has been completed
 */
export function isMigrationCompleted(): boolean {
  return localStorage.getItem('migration_completed') === 'true';
}

/**
 * Check if there's data to migrate
 */
export function hasLocalDataToMigrate(): boolean {
  const localVehiclesStr = localStorage.getItem('vehicles');
  if (!localVehiclesStr) return false;
  
  try {
    const vehicles = JSON.parse(localVehiclesStr);
    return Array.isArray(vehicles) && vehicles.length > 0;
  } catch {
    return false;
  }
}

/**
 * Backup localStorage data before migration
 */
export function backupLocalStorage(): void {
  const localVehiclesStr = localStorage.getItem('vehicles');
  if (localVehiclesStr) {
    const backup = {
      timestamp: new Date().toISOString(),
      data: localVehiclesStr,
    };
    localStorage.setItem('vehicles_backup', JSON.stringify(backup));
    console.log('✅ Backup created');
  }
}

/**
 * Restore from backup if migration fails
 */
export function restoreFromBackup(): boolean {
  const backupStr = localStorage.getItem('vehicles_backup');
  if (!backupStr) {
    console.log('No backup found');
    return false;
  }

  try {
    const backup = JSON.parse(backupStr);
    localStorage.setItem('vehicles', backup.data);
    console.log('✅ Restored from backup');
    return true;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return false;
  }
}
