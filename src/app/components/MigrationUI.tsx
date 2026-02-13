import { useState, useEffect } from 'react';
import { 
  migrateLocalStorageToSupabase, 
  hasLocalDataToMigrate,
  backupLocalStorage
} from '../../utils/migration/migrateToSupabase';
import { Database, Upload, CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';

interface MigrationUIProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function MigrationUI({ onComplete, onSkip }: MigrationUIProps) {
  const [migrating, setMigrating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [migratedCount, setMigratedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    setHasData(hasLocalDataToMigrate());
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    setStatus('migrating');
    setErrors([]);

    try {
      // Create backup first
      backupLocalStorage();

      // Perform migration
      const result = await migrateLocalStorageToSupabase();

      setMigratedCount(result.migratedCount);

      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setStatus('error');
        setErrors(result.errors);
      }
    } catch (error) {
      console.error('Migration error:', error);
      setStatus('error');
      setErrors([`Unexpected error: ${error}`]);
    } finally {
      setMigrating(false);
    }
  };

  if (!hasData) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">All Set!</h2>
          <p className="text-muted-foreground mb-6">
            No data to migrate. You're ready to start using the app!
          </p>
          <button onClick={onComplete} className="btn-primary w-full">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === 'idle' && <Database className="w-8 h-8 text-primary" />}
            {status === 'migrating' && <Loader className="w-8 h-8 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-success" />}
            {status === 'error' && <XCircle className="w-8 h-8 text-destructive" />}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {status === 'idle' && 'Migrate Your Data'}
            {status === 'migrating' && 'Migrating...'}
            {status === 'success' && 'Migration Complete!'}
            {status === 'error' && 'Migration Failed'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {status === 'idle' && 'We found existing vehicles on this device. Migrate them to the cloud for secure storage and multi-device sync.'}
            {status === 'migrating' && 'Please wait while we transfer your vehicles to the cloud...'}
            {status === 'success' && `Successfully migrated ${migratedCount} vehicle${migratedCount !== 1 ? 's' : ''}!`}
            {status === 'error' && 'Something went wrong during migration. Your data is safe in localStorage.'}
          </p>
        </div>

        {/* Status */}
        {status === 'idle' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Upload className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">What happens next?</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Your vehicles will be backed up locally</li>
                    <li>• Data will be transferred to Supabase</li>
                    <li>• You'll be able to access it from any device</li>
                    <li>• Local storage will be cleared after success</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-warning mb-1">Important</h3>
                  <p className="text-xs text-muted-foreground">
                    A backup will be created automatically. If migration fails, your data remains safe in localStorage.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleMigrate}
                disabled={migrating}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Migrate to Cloud
              </button>
              <button
                onClick={onSkip}
                className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Migrating State */}
        {status === 'migrating' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="w-10 h-10 text-primary" />
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Transferring your vehicles to the cloud...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="space-y-4">
            <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-sm font-semibold text-success mb-1">
                Migration Successful!
              </p>
              <p className="text-xs text-muted-foreground">
                Your vehicles are now safely stored in the cloud
              </p>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              Redirecting...
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-destructive mb-2">
                    Migration Failed
                  </h3>
                  <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                    {errors.map((error, index) => (
                      <p key={index} className="break-words">• {error}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Don't worry!</strong> Your original data is still safe in localStorage. You can try again later or continue using the app normally.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleMigrate}
                className="btn-primary w-full"
              >
                Try Again
              </button>
              <button
                onClick={onSkip}
                className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Continue Without Migrating
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
