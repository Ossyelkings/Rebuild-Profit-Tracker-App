import { User, Database, Moon, DollarSign, Download, Mail, Shield, LogOut, Sun, Globe, Type, Bell, CreditCard, ChevronRight, HelpCircle, MessageCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

interface ProfileProps {
  onLogout: () => void;
  userPhoneNumber: string;
  onNavigateToSubscription?: () => void;
  onClearData?: () => void;
}

export function Profile({ onLogout, userPhoneNumber, onNavigateToSubscription, onClearData }: ProfileProps) {
  const { theme, toggleTheme } = useTheme();

  // Get user info from localStorage
  const getUserInfo = () => {
    const storedUsers = localStorage.getItem('rebuild_users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      return users.find((u: any) => u.phoneNumber === userPhoneNumber);
    }
    return null;
  };

  const user = getUserInfo();

  const handleExportData = () => {
    const data = localStorage.getItem('rebuild_profit_tracker_vehicles');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rebuild-profit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string;
            localStorage.setItem('rebuild_profit_tracker_vehicles', data);
            alert('Data imported successfully! Please refresh the page.');
          } catch (error) {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('Medium');
  const [notifications, setNotifications] = useState(true);

  // FAQ state
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I add a new vehicle?",
      answer: "Tap the '+' button in the bottom navigation to add a new vehicle. Fill in the vehicle details including VIN, make, model, purchase price, and other information. You can also upload photos of the vehicle."
    },
    {
      question: "How are profits calculated?",
      answer: "Profit is calculated as: (Sale Price - Total Investment). Total Investment includes: Purchase Price + Transport Cost + All Repair Costs. ROI is calculated as: (Profit / Total Investment) × 100%."
    },
    {
      question: "Can I track multiple vehicles at once?",
      answer: "Yes! You can add unlimited vehicles and track them all simultaneously. Each vehicle has its own detailed cost breakdown, timeline, and profit calculations."
    },
    {
      question: "How do I export my data?",
      answer: "Go to Profile > Data Management > Export Data. This will download a JSON backup file of all your vehicles and costs. Keep this file safe as a backup."
    },
    {
      question: "What happens when registration expires?",
      answer: "When you mark a vehicle as 'Completed', you can optionally add registration details. The app will show warnings when registration is expiring (30 days) or has expired."
    },
    {
      question: "How do I change the theme?",
      answer: "You can switch between Dark and Light themes by tapping the theme toggle button on the Dashboard or in Profile > App Settings > Theme."
    },
    {
      question: "Are my vehicles backed up?",
      answer: "All data is stored locally on your device. Use the Export Data feature regularly to create backups. You can restore your data anytime using Import Data."
    },
    {
      question: "Can I delete a vehicle?",
      answer: "Yes, you can delete a vehicle from the vehicle details page. However, this action cannot be undone, so make sure to export your data first if needed."
    }
  ];

  // Sample subscription data
  const subscriptionStartDate = '2026-01-01';
  const subscriptionEndDate = '2026-12-31';
  const daysRemaining = Math.ceil((new Date(subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="p-6">
        <h1 className="text-3xl mb-8">Profile & Settings</h1>

        {/* User Info */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xl mb-1">{user ? user.name : 'Demo User'}</div>
              <div className="text-sm text-muted-foreground">{userPhoneNumber}</div>
              {user && user.email && (
                <div className="text-sm text-muted-foreground">{user.email}</div>
              )}
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                onLogout();
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* App Settings */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg">App Settings</h2>
            </div>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <span>Currency</span>
              </div>
              <span className="text-muted-foreground">{currency}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                <span>Theme</span>
              </div>
              <span className="text-muted-foreground">{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span>Language</span>
              </div>
              <span className="text-muted-foreground">{language}</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-muted-foreground" />
                <span>Font Size</span>
              </div>
              <span className="text-muted-foreground">{fontSize}</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span>Notifications</span>
              </div>
              <span className="text-muted-foreground">{notifications ? 'On' : 'Off'}</span>
            </button>
          </div>

          {/* Subscription */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg">Subscription</h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1">Premium Plan</div>
                  <div className="text-sm text-muted-foreground">Active subscription</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  daysRemaining > 30 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : daysRemaining > 7
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Date</span>
                  <span>{new Date(subscriptionStartDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">End Date</span>
                  <span>{new Date(subscriptionEndDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Billing Cycle</span>
                  <span>Yearly</span>
                </div>
              </div>

              <button
                onClick={onNavigateToSubscription}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors"
              >
                Manage Subscription
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg">Data Management</h2>
            </div>
            
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <div>Export Data</div>
                  <div className="text-xs text-muted-foreground">Download backup as JSON</div>
                </div>
              </div>
            </button>

            <button
              onClick={handleImportData}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <div>Import Data</div>
                  <div className="text-xs text-muted-foreground">Restore from backup</div>
                </div>
              </div>
            </button>

            <button
              onClick={onClearData}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <div>Clear Data</div>
                  <div className="text-xs text-muted-foreground">Remove all data</div>
                </div>
              </div>
            </button>
          </div>

          {/* Support */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg">Support</h2>
            </div>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span>Contact Support</span>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy Policy</span>
              </div>
            </button>
          </div>

          {/* FAQ */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg">Frequently Asked Questions</h2>
            </div>
            
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full flex items-start justify-between p-4 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="flex-1">{faq.question}</span>
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${
                      expandedFAQ === index ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-4 pb-4 pt-0 pl-12 text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-muted-foreground text-sm mt-8">
          <div className="mb-1">Rebuild Profit Tracker</div>
          <div>Version 1.0.0</div>
        </div>
      </div>
    </div>
  );
}