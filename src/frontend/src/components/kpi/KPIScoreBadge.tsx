import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { ACTIVITIES, getActivityLabel } from '../../lib/kpi';
import type { KPIConfig } from '../../backend';

interface KPIPreview {
  total: number;
  breakdown: Record<string, number>;
}

interface KPIScoreBadgeProps {
  kpi: KPIPreview;
  weights?: KPIConfig | null;
}

export default function KPIScoreBadge({ kpi, weights }: KPIScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-teal-600 dark:text-teal-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-lg">KPI Preview</h3>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(kpi.total)}`}>
              {kpi.total.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">out of 100</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ACTIVITIES.map((activity) => {
            const value = kpi.breakdown[activity.key] || 0;
            const label = getActivityLabel(activity.key, weights);
            
            return (
              <div key={activity.key} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                <span className="text-xs font-medium text-muted-foreground truncate mr-2">
                  {label}
                </span>
                <Badge variant="outline" className="font-mono text-xs">
                  {value.toFixed(1)}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
