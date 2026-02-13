import { useState } from 'react';
import { Lock, Car, ArrowLeft, ChevronDown, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (phoneNumber: string) => void;
  onSwitchToRegister: () => void;
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

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [formData, setFormData] = useState({
    countryCode: '+61',
    phoneNumber: '',
    pin: '',
  });
  const [error, setError] = useState('');
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.phoneNumber.length < 6) {
      setError('Please enter a valid phone number');
      return;
    }

    if (formData.pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    const fullPhoneNumber = formData.countryCode + formData.phoneNumber;

    // Get stored users from localStorage
    const storedUsers = localStorage.getItem('rebuild_users');
    if (!storedUsers) {
      setError('No account found. Please register first.');
      return;
    }

    const users = JSON.parse(storedUsers);
    const user = users.find((u: any) => u.phoneNumber === fullPhoneNumber);

    if (!user) {
      setError('No account found with this phone number');
      return;
    }

    if (user.pin !== formData.pin) {
      setError('Incorrect PIN');
      return;
    }

    // Login successful
    onLogin(fullPhoneNumber);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    return cleaned;
  };

  const selectedCountry = countries.find(c => c.code === formData.countryCode) || countries[0];

  const ForgotPinForm = ({ onBack }: { onBack: () => void }) => {
    const [resetStep, setResetStep] = useState<'verify' | 'reset'>('verify');
    const [resetData, setResetData] = useState({
      countryCode: '+61',
      phoneNumber: '',
      email: '',
      newPin: '',
      confirmPin: '',
    });
    const [resetError, setResetError] = useState('');
    const [verifiedUser, setVerifiedUser] = useState<any>(null);
    const [showResetCountryDropdown, setShowResetCountryDropdown] = useState(false);

    const resetSelectedCountry = countries.find(c => c.code === resetData.countryCode) || countries[0];

    const handleVerifySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setResetError('');

      if (resetData.phoneNumber.length < 6) {
        setResetError('Please enter a valid phone number');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(resetData.email)) {
        setResetError('Please enter a valid email address');
        return;
      }

      const fullPhoneNumber = resetData.countryCode + resetData.phoneNumber;

      // Get stored users from localStorage
      const storedUsers = localStorage.getItem('rebuild_users');
      if (!storedUsers) {
        setResetError('No account found with these credentials');
        return;
      }

      const users = JSON.parse(storedUsers);
      const user = users.find(
        (u: any) => u.phoneNumber === fullPhoneNumber && u.email === resetData.email
      );

      if (!user) {
        setResetError('No account found with these credentials');
        return;
      }

      // Verification successful
      setVerifiedUser(user);
      setResetStep('reset');
    };

    const handleResetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setResetError('');

      // Validate new PIN
      if (resetData.newPin.length < 4) {
        setResetError('PIN must be at least 4 digits');
        return;
      }

      if (resetData.newPin !== resetData.confirmPin) {
        setResetError('PINs do not match');
        return;
      }

      // Update user's PIN
      const storedUsers = localStorage.getItem('rebuild_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const updatedUsers = users.map((u: any) => {
          if (u.phoneNumber === verifiedUser.phoneNumber) {
            return { ...u, pin: resetData.newPin };
          }
          return u;
        });
        localStorage.setItem('rebuild_users', JSON.stringify(updatedUsers));
        
        alert('Your PIN has been successfully reset! You can now sign in with your new PIN.');
        onBack();
      }
    };

    return (
      <>
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Car className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl mb-2">
            {resetStep === 'verify' ? 'Reset PIN' : 'Create New PIN'}
          </h1>
          <p className="text-zinc-400">
            {resetStep === 'verify' 
              ? 'Enter your phone number and email to verify your identity'
              : 'Enter your new PIN'
            }
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          {resetStep === 'verify' ? (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Mobile number</label>
                <div className="flex gap-2">
                  {/* Country Code Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowResetCountryDropdown(!showResetCountryDropdown)}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 focus:outline-none focus:border-blue-500 flex items-center gap-2 hover:bg-zinc-750 transition-colors"
                    >
                      <span className="text-xl">{resetSelectedCountry.flag}</span>
                      <span className="text-zinc-200">{resetSelectedCountry.code}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    </button>

                    {/* Country Dropdown */}
                    {showResetCountryDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowResetCountryDropdown(false)}
                        />
                        <div className="absolute top-full left-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto w-64">
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setResetData({ ...resetData, countryCode: country.code });
                                setShowResetCountryDropdown(false);
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
                    value={resetData.phoneNumber}
                    onChange={(e) => setResetData({ 
                      ...resetData, 
                      phoneNumber: formatPhoneNumber(e.target.value)
                    })}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="412 345 678"
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
                    value={resetData.email}
                    onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
              </div>

              {resetError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-sm">{resetError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors"
              >
                Verify Identity
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">New PIN (4-6 digits)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={resetData.newPin}
                    onChange={(e) => setResetData({ 
                      ...resetData, 
                      newPin: e.target.value.replace(/\D/g, '') 
                    })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="Enter new PIN"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Confirm New PIN</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    value={resetData.confirmPin}
                    onChange={(e) => setResetData({ 
                      ...resetData, 
                      confirmPin: e.target.value.replace(/\D/g, '') 
                    })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
                    placeholder="Confirm new PIN"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {resetError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-sm">{resetError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors"
              >
                Reset PIN
              </button>
            </form>
          )}

          {/* Back Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {!showForgotPin ? (
          <>
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                <Car className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-3xl mb-2">Rebuild Profit Tracker</h1>
              <p className="text-zinc-400">Sign in to your account</p>
            </div>

            {/* Login Form */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-zinc-400">PIN</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPin(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot PIN?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="password"
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
                      placeholder="Enter your PIN"
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
                  Sign In
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-zinc-400 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={onSwitchToRegister}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Register
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
          </>
        ) : (
          <ForgotPinForm onBack={() => setShowForgotPin(false)} />
        )}
      </div>
    </div>
  );
}