import { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithPhone, signUpWithPhone } from '../../utils/supabase/auth';
import { LogIn, UserPlus, Mail, Phone } from 'lucide-react';

interface SupabaseLoginProps {
  onLoginSuccess: () => void;
}

export function SupabaseLogin({ onLoginSuccess }: SupabaseLoginProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSetupWarning, setShowSetupWarning] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (authMethod === 'email') {
        if (mode === 'signup') {
          await signUpWithEmail(email, password);
          setSuccess('Account created! Please check your email to verify your account.');
        } else {
          await signInWithEmail(email, password);
          setSuccess('Signed in successfully!');
          setTimeout(() => onLoginSuccess(), 1000);
        }
      } else {
        // Phone auth
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        
        if (mode === 'signup') {
          await signUpWithPhone(formattedPhone, password);
          setSuccess('Account created! Please check your phone for verification code.');
        } else {
          await signInWithPhone(formattedPhone, password);
          setSuccess('Signed in successfully!');
          setTimeout(() => onLoginSuccess(), 1000);
        }
      }
    } catch (err: any) {
      // Handle specific error messages
      let errorMessage = err.message || 'Authentication failed. Please try again.';
      
      if (errorMessage.includes('Email logins are disabled')) {
        errorMessage = '❌ EMAIL AUTHENTICATION NOT ENABLED - You need to enable the Email provider in Supabase! See the orange warning box above for step-by-step instructions.';
        // Show the warning again if they dismissed it
        setShowSetupWarning(true);
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = `❌ EMAIL NOT CONFIRMED - QUICK FIX:

Option 1 (Recommended): Disable email confirmation
1. Go to app.supabase.com
2. Authentication → Providers → Email
3. Turn OFF "Confirm email" toggle
4. Click Save
5. Sign up with a NEW email

Option 2: Manually confirm your account
1. Go to app.supabase.com
2. Authentication → Users
3. Find email: ${email}
4. Click "..." → Confirm User
5. Try signing in again

Choose Option 1 for faster testing!`;
        // Show the warning again if they dismissed it
        setShowSetupWarning(true);
      } else if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'This email is already registered. Try signing in instead.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">Rebuild Profit Tracker</h1>
          <p className="text-muted-foreground">Track vehicle repairs & maximize profits</p>
        </div>

        {/* Setup Warning Banner */}
        {showSetupWarning && (
          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-2xl p-6 mb-6 animate-pulse">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 animate-bounce">
                <span className="text-white text-lg font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-orange-500 mb-3">⚠️ SETUP REQUIRED: Authentication Not Configured</h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-sm font-bold text-red-500 mb-2">Current Errors:</p>
                  <ul className="text-xs text-red-500 space-y-1">
                    <li>• "Email logins are disabled" = Email provider not enabled</li>
                    <li>• "Email not confirmed" = Confirm email not disabled</li>
                  </ul>
                </div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Follow these steps in Supabase Dashboard:
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside mb-4 bg-muted/30 rounded-lg p-3">
                  <li>Open <strong className="text-orange-500">app.supabase.com</strong></li>
                  <li>Click <strong className="text-orange-500">Authentication → Providers</strong></li>
                  <li>Find <strong className="text-orange-500">"Email"</strong> and <strong className="text-green-500">Enable it</strong></li>
                  <li>Click on Email to open settings</li>
                  <li><strong className="text-red-500">Disable "Confirm email"</strong> toggle</li>
                  <li>Click <strong className="text-blue-500">"Save"</strong></li>
                </ol>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-500 font-semibold mb-1">
                    📖 Detailed Setup Guide:
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Open <strong>/SUPABASE_AUTH_SETUP.md</strong> in your project for step-by-step instructions with screenshots.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  ⏱️ This setup takes 5 minutes and is only needed once for testing.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSetupWarning(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl text-sm font-bold transition-colors"
            >
              ✅ I've completed all setup steps - Continue
            </button>
          </div>
        )}

        {/* Auth Method Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAuthMethod('email')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              authMethod === 'email'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              authMethod === 'phone'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            <Phone className="w-4 h-4" />
            Phone
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMethod === 'email' ? (
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="your@email.com"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  placeholder="+61400000000"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code (e.g., +61 for Australia)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                {mode === 'signup' ? 'Create Password' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {mode === 'signup' ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground text-center">
              {mode === 'signup' 
                ? '🔒 Your data is encrypted and secure. We never share your information.'
                : '💡 Forgot your password? Contact support or create a new account.'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>By using this app, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}