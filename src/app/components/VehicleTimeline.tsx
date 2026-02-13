import { Vehicle } from '../types';
import { CheckCircle, Clock, DollarSign, ShoppingCart } from 'lucide-react';

interface VehicleTimelineProps {
  vehicle: Vehicle;
}

export function VehicleTimeline({ vehicle }: VehicleTimelineProps) {
  const timelineSteps = [
    {
      label: 'Purchased',
      date: vehicle.purchaseDate,
      completed: true,
      icon: ShoppingCart,
      description: `Purchased from ${vehicle.auction}`,
    },
    {
      label: 'In Repair',
      date: vehicle.purchaseDate,
      completed: vehicle.status === 'Completed' || vehicle.status === 'Sold',
      current: vehicle.status === 'In Repair',
      icon: Clock,
      description: vehicle.costs.length > 0 ? `${vehicle.costs.length} cost${vehicle.costs.length !== 1 ? 's' : ''} added` : 'No costs yet',
    },
    {
      label: 'Completed',
      date: vehicle.completedDate,
      completed: vehicle.status === 'Completed' || vehicle.status === 'Sold',
      current: vehicle.status === 'Completed',
      icon: CheckCircle,
      description: vehicle.registrationNumber ? `Reg: ${vehicle.registrationNumber}` : 'Ready for sale',
    },
    {
      label: 'Sold',
      date: vehicle.soldDate,
      completed: vehicle.status === 'Sold',
      current: vehicle.status === 'Sold',
      icon: DollarSign,
      description: vehicle.soldDate ? `Sold on ${new Date(vehicle.soldDate).toLocaleDateString()}` : 'Not sold yet',
    },
  ];

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h2 className="text-xl mb-6">Vehicle Timeline</h2>
      
      <div className="relative">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === timelineSteps.length - 1;
          
          return (
            <div key={step.label} className="relative pb-8 last:pb-0">
              {/* Vertical line */}
              {!isLast && (
                <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                  step.completed ? 'bg-blue-600' : 'bg-border'
                }`} />
              )}
              
              {/* Timeline node */}
              <div className="flex items-start gap-4">
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                  step.completed 
                    ? 'bg-blue-600 text-white' 
                    : step.current
                    ? 'bg-orange-600 text-white animate-pulse'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium ${
                      step.completed || step.current ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                      {step.current && (
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                          Current
                        </span>
                      )}
                    </h3>
                    {step.date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(step.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
