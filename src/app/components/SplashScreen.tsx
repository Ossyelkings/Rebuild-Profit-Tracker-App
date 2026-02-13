import { useEffect } from 'react';
import { Car } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 z-[100] flex items-center justify-center">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-white rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-center px-6">
        {/* Comic Car Illustration */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
          
          {/* Hand-drawn style car SVG */}
          <div className="w-64 h-64 mx-auto flex items-center justify-center animate-fadeInScale">
            <svg viewBox="0 0 200 120" className="w-full h-auto drop-shadow-2xl">
              {/* Car body shadow */}
              <ellipse cx="100" cy="105" rx="70" ry="8" fill="rgba(0,0,0,0.2)" />
              
              {/* Car body - main */}
              <path 
                d="M 30 70 Q 30 60 40 60 L 60 60 L 70 40 Q 72 35 80 35 L 120 35 Q 128 35 130 40 L 140 60 L 160 60 Q 170 60 170 70 L 170 90 Q 170 95 165 95 L 155 95 Q 155 95 155 90 L 45 90 Q 45 95 45 95 L 35 95 Q 30 95 30 90 Z" 
                fill="#FFD700" 
                stroke="#2C3E50" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Car windows */}
              <path 
                d="M 75 42 L 85 42 L 85 60 L 75 60 Z" 
                fill="#87CEEB" 
                stroke="#2C3E50" 
                strokeWidth="2.5"
              />
              <path 
                d="M 90 42 L 120 42 L 125 60 L 90 60 Z" 
                fill="#87CEEB" 
                stroke="#2C3E50" 
                strokeWidth="2.5"
              />
              
              {/* Headlight */}
              <circle cx="162" cy="75" r="6" fill="#FFF8DC" stroke="#2C3E50" strokeWidth="2.5" />
              
              {/* Door handle */}
              <line x1="110" y1="70" x2="120" y2="70" stroke="#2C3E50" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* Wheels */}
              <g>
                {/* Back wheel */}
                <circle cx="55" cy="95" r="15" fill="#2C3E50" stroke="#2C3E50" strokeWidth="3" />
                <circle cx="55" cy="95" r="10" fill="#778899" />
                <circle cx="55" cy="95" r="4" fill="#2C3E50" />
                
                {/* Front wheel */}
                <circle cx="145" cy="95" r="15" fill="#2C3E50" stroke="#2C3E50" strokeWidth="3" />
                <circle cx="145" cy="95" r="10" fill="#778899" />
                <circle cx="145" cy="95" r="4" fill="#2C3E50" />
              </g>
              
              {/* Comic-style speed lines */}
              <line x1="10" y1="50" x2="20" y2="50" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <line x1="8" y1="60" x2="18" y2="60" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <line x1="12" y1="70" x2="22" y2="70" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              
              {/* Dollar signs floating */}
              <text x="175" y="30" fontSize="16" fill="#2ECC71" fontWeight="bold">$</text>
              <text x="185" y="20" fontSize="14" fill="#2ECC71" fontWeight="bold">$</text>
              <text x="170" y="18" fontSize="12" fill="#2ECC71" fontWeight="bold">$</text>
            </svg>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-white mb-3 animate-fadeInUp">
          Rebuild Profit Tracker
        </h1>
        
        {/* Tagline */}
        <p className="text-blue-100 text-lg mb-8 animate-fadeInUp delay-200">
          Track. Repair. Profit.
        </p>

        {/* Loading indicator */}
        <div className="flex justify-center items-center gap-2 animate-fadeInUp delay-300">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.6s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .delay-150 {
          animation-delay: 150ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}