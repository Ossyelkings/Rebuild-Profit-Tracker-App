import { ActivityLogEntry } from '../types';
import { Clock, TrendingUp, DollarSign, Edit, Trash, Plus, FileText } from 'lucide-react';

interface ActivityLogProps {
  activityLog: ActivityLogEntry[];
}

export function ActivityLog({ activityLog }: ActivityLogProps) {
  const getActivityIcon = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'status_change':
        return TrendingUp;
      case 'cost_added':
        return Plus;
      case 'cost_edited':
        return Edit;
      case 'cost_deleted':
        return Trash;
      case 'vehicle_created':
        return FileText;
      case 'vehicle_edited':
        return Edit;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'status_change':
        return 'text-blue-600 bg-blue-100';
      case 'cost_added':
        return 'text-green-600 bg-green-100';
      case 'cost_edited':
        return 'text-orange-600 bg-orange-100';
      case 'cost_deleted':
        return 'text-red-600 bg-red-100';
      case 'vehicle_created':
        return 'text-purple-600 bg-purple-100';
      case 'vehicle_edited':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const sortedLog = [...activityLog].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h2 className="text-xl mb-4">Activity Log</h2>
      
      {activityLog.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedLog.map((entry) => {
            const Icon = getActivityIcon(entry.type);
            const colorClass = getActivityColor(entry.type);
            
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{entry.description}</p>
                  {entry.details && (
                    <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
