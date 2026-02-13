import { useState } from 'react';
import { Lock, User, Car, Mail, ChevronDown } from 'lucide-react';

interface RegisterProps {
  onRegister: (phoneNumber: string) => void;
  onSwitchToLogin: () => void;
}

const countries = [
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
];

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+61',
    phoneNumber: '',
    pin: '',
    confirmPin: '',
  });
  const [error, setError] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate name
    if (formData.name.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate phone number
    if (formData.phoneNumber.length < 6) {
      setError('Please enter a valid phone number');
      return;
    }

    // Validate PIN
    if (formData.pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match');
      return;
    }

    const fullPhoneNumber = formData.countryCode + formData.phoneNumber;

    // Check if phone number already exists
    const storedUsers = localStorage.getItem('rebuild_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    const existingUser = users.find((u: any) => u.phoneNumber === fullPhoneNumber);
    if (existingUser) {
      setError('An account with this phone number already exists');
      return;
    }

    // Create new user
    const newUser = {
      name: formData.name,
      email: formData.email,
      phoneNumber: fullPhoneNumber,
      pin: formData.pin,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('rebuild_users', JSON.stringify(users));

    // Register successful
    onRegister(fullPhoneNumber);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    return cleaned;
  };

  const selectedCountry = countries.find(c => c.code === formData.countryCode) || countries[0];

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Car className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl mb-2">Create Account</h1>
          <p className="text-zinc-400">Start tracking your rebuild profits</p>
        </div>

        {/* Register Form */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Mobile number</label>
              <div className="flex gap-2">
                {/* Country Code Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 focus:outline-none focus:border-blue-500 flex items-center gap-2 hover:bg-zinc-750 transition-colors"
                  >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-zinc-200">{selectedCountry.code}</span>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </button>

                  {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowCountryDropdown(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto w-64">
                        {countries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, countryCode: country.code });
                              setShowCountryDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left"
                          >
                            <span className="text-xl">{country.flag}</span>
                            <span className="flex-1 text-zinc-200">{country.name}</span>
                            <span className="text-zinc-400">{country.code}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Phone Number Input */}
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    phoneNumber: formatPhoneNumber(e.target.value)
                  })}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="412 345 678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Create PIN (4-6 digits)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={formData.pin}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    pin: e.target.value.replace(/\D/g, '') 
                  })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="Enter PIN"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Confirm PIN</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={formData.confirmPin}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    confirmPin: e.target.value.replace(/\D/g, '') 
                  })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="Confirm PIN"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors"
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs text-center">
            This is a demo authentication system. Your data is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
