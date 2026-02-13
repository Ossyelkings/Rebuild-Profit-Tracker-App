import { Car, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLoadSample: () => void;
}

export function WelcomeScreen({ onGetStarted, onLoadSample }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 pb-24">
      <div className="max-w-md w-full">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-6 rounded-3xl">
            <Car className="w-16 h-16" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl text-center mb-4">
          Rebuild Profit Tracker
        </h1>
        <p className="text-center text-zinc-400 mb-12">
          Track repairs, calculate profits, and manage your automotive rebuild projects with precision.
        </p>

        {/* Features */}
        <div className="space-y-4 mb-12">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600/20 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="mb-1">Track Every Cost</div>
              <div className="text-sm text-zinc-400">
                Record parts, labor, and all expenses in one place
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-green-600/20 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="mb-1">Calculate Profit Instantly</div>
              <div className="text-sm text-zinc-400">
                See real-time ROI and profit margins for every vehicle
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-purple-600/20 p-3 rounded-xl">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="mb-1">Professional Reports</div>
              <div className="text-sm text-zinc-400">
                Generate detailed reports and export data
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={onGetStarted}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl transition-colors"
          >
            Get Started
          </button>
          <button
            onClick={onLoadSample}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-xl transition-colors"
          >
            Load Sample Data
          </button>
        </div>

        <p className="text-center text-zinc-500 text-xs mt-8">
          All data is stored locally on your device
        </p>
      </div>
    </div>
  );
}