import { useState, useEffect } from 'react';
import { Vehicle, CostTemplate } from './types';
import { Dashboard } from './components/Dashboard';
import { VehiclesList } from './components/VehiclesList';
import { VehicleDetail } from './components/VehicleDetail';
import { AddVehicle } from './components/AddVehicle';
import { Reports } from './components/Reports';
import { Profile } from './components/Profile';
import { ManageSubscription } from './components/ManageSubscription';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SplashScreen } from './components/SplashScreen';
import { SupabaseLogin } from './components/SupabaseLogin';
import { MigrationUI } from './components/MigrationUI';
import { saveCostTemplates, loadCostTemplates } from './utils/storage';
import { sampleVehicles } from './data/sampleData';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { 
  getVehicles, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} from '../utils/supabase/database';
import { hasLocalDataToMigrate, isMigrationCompleted } from '../utils/migration/migrateToSupabase';
import { Home, Car, Plus, BarChart3, User, Loader } from 'lucide-react';

type Tab = 'dashboard' | 'vehicles' | 'add' | 'reports' | 'profile' | 'subscription';

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [costTemplates, setCostTemplates] = useState<CostTemplate[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Check for auth errors in URL (from email confirmation links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      // Clear the error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show helpful message
      if (error === 'access_denied' || errorDescription?.includes('expired')) {
        alert(`⚠️ EMAIL CONFIRMATION LINK EXPIRED!

This happened because email confirmation is still ENABLED in Supabase.

QUICK FIX:
1. Go to app.supabase.com
2. Authentication → Providers → Email
3. Turn OFF "Confirm email" toggle
4. Click Save
5. Come back and sign up with a NEW email

Email confirmation links expire quickly. 
Disable it for faster testing!`);
      }
    }
  }, []);

  // Load vehicles from Supabase when authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadVehiclesFromDatabase();
      
      // Check if we need to show migration UI
      if (hasLocalDataToMigrate() && !isMigrationCompleted()) {
        setShowMigration(true);
      }
    }
  }, [user, authLoading]);

  // Load cost templates from localStorage (these stay local for now)
  useEffect(() => {
    if (user) {
      const loadedTemplates = loadCostTemplates();
      setCostTemplates(loadedTemplates);
    }
  }, [user]);

  // Save cost templates whenever they change
  useEffect(() => {
    if (user) {
      saveCostTemplates(costTemplates);
    }
  }, [costTemplates, user]);

  const loadVehiclesFromDatabase = async () => {
    setLoadingVehicles(true);
    try {
      const loadedVehicles = await getVehicles();
      setVehicles(loadedVehicles);
      
      // Show welcome screen if no vehicles
      if (loadedVehicles.length === 0 && !localStorage.getItem('rebuild_profit_tracker_welcomed')) {
        setShowWelcome(true);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleAddVehicle = async (vehicle: Vehicle) => {
    try {
      const newVehicle = await createVehicle(vehicle);
      setVehicles([newVehicle, ...vehicles]);
      setCurrentTab('vehicles');
      setSelectedVehicleId(newVehicle.id);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Failed to add vehicle. Please try again.');
    }
  };

  const handleUpdateVehicle = async (updatedVehicle: Vehicle) => {
    try {
      await updateVehicle(updatedVehicle.id, updatedVehicle);
      setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle. Please try again.');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await deleteVehicle(vehicleId);
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      setSelectedVehicleId(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle. Please try again.');
    }
  };

  const handleNavigate = (tab: string, vehicleId?: string) => {
    setCurrentTab(tab as Tab);
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
    }
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleBackFromDetail = () => {
    setSelectedVehicleId(null);
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to delete all vehicles? This cannot be undone.')) {
      try {
        // Delete all vehicles one by one
        for (const vehicle of vehicles) {
          await deleteVehicle(vehicle.id);
        }
        setVehicles([]);
        setCurrentTab('dashboard');
        setSelectedVehicleId(null);
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear data. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setVehicles([]);
      setCurrentTab('dashboard');
      setSelectedVehicleId(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleWelcomeGetStarted = () => {
    setShowWelcome(false);
    localStorage.setItem('rebuild_profit_tracker_welcomed', 'true');
    setCurrentTab('add');
  };

  const handleWelcomeLoadSample = async () => {
    setShowWelcome(false);
    localStorage.setItem('rebuild_profit_tracker_welcomed', 'true');
    
    // Import sample vehicles to database
    try {
      for (const vehicle of sampleVehicles) {
        await createVehicle(vehicle);
      }
      await loadVehiclesFromDatabase();
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  };

  const handleMigrationComplete = async () => {
    setShowMigration(false);
    await loadVehiclesFromDatabase();
  };

  const handleMigrationSkip = () => {
    setShowMigration(false);
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show login if not authenticated
  if (!user && !authLoading) {
    return <SupabaseLogin onLoginSuccess={() => {}} />;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show migration UI
  if (showMigration) {
    return (
      <MigrationUI 
        onComplete={handleMigrationComplete}
        onSkip={handleMigrationSkip}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-2xl mx-auto transition-colors">
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {loadingVehicles ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading vehicles...</p>
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard vehicles={vehicles} onNavigate={handleNavigate} />
            )}
            
            {currentTab === 'vehicles' && !selectedVehicle && (
              <VehiclesList
                vehicles={vehicles}
                onSelectVehicle={handleSelectVehicle}
                onAddVehicle={() => setCurrentTab('add')}
              />
            )}

            {currentTab === 'vehicles' && selectedVehicle && (
              <VehicleDetail
                vehicle={selectedVehicle}
                onBack={handleBackFromDetail}
                onUpdateVehicle={handleUpdateVehicle}
                onDeleteVehicle={handleDeleteVehicle}
              />
            )}

            {currentTab === 'add' && (
              <AddVehicle
                onBack={() => setCurrentTab('vehicles')}
                onSave={handleAddVehicle}
              />
            )}

            {currentTab === 'reports' && (
              <Reports vehicles={vehicles} />
            )}

            {currentTab === 'profile' && (
              <Profile 
                onLogout={handleLogout}
                userPhoneNumber={user?.phone || user?.email || 'User'}
                onNavigateToSubscription={() => setCurrentTab('subscription')}
                onClearData={handleClearData}
              />
            )}

            {currentTab === 'subscription' && (
              <ManageSubscription 
                onBack={() => setCurrentTab('profile')}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border max-w-2xl mx-auto">
        <div className="flex justify-around items-center h-20 px-4">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 gap-1 transition-colors ${
              currentTab === 'dashboard' ? 'text-blue-600' : 'text-muted-foreground'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('vehicles');
              setSelectedVehicleId(null);
            }}
            className={`flex flex-col items-center justify-center flex-1 gap-1 transition-colors ${
              currentTab === 'vehicles' ? 'text-blue-600' : 'text-muted-foreground'
            }`}
          >
            <Car className="w-6 h-6" />
            <span className="text-xs">Vehicles</span>
          </button>

          <button
            onClick={() => setCurrentTab('add')}
            className="flex flex-col items-center justify-center -mt-8"
          >
            <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-600/50 mb-1">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Add</span>
          </button>

          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex flex-col items-center justify-center flex-1 gap-1 transition-colors ${
              currentTab === 'reports' ? 'text-blue-600' : 'text-muted-foreground'
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs">Reports</span>
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 gap-1 transition-colors ${
              currentTab === 'profile' ? 'text-blue-600' : 'text-muted-foreground'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>

      {/* Welcome Screen */}
      {showWelcome && (
        <WelcomeScreen
          onGetStarted={handleWelcomeGetStarted}
          onLoadSample={handleWelcomeLoadSample}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}