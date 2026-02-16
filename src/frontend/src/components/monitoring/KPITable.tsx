import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Submission, UserProfile, KPIConfig } from '../../backend';
import type { Principal } from '@icp-sdk/core/principal';
import { ACTIVITIES, getActivityLabel } from '../../lib/kpi';

interface KPITableProps {
  data: Array<{ principal: Principal; submission: Submission }>;
  profiles: Array<[Principal, UserProfile]>;
  weights: KPIConfig | null;
  isLoading: boolean;
}

export default function KPITable({ data, profiles, weights, isLoading }: KPITableProps) {
  const getPrincipalName = (principal: Principal) => {
    const profile = profiles.find(([p]) => p.toString() === principal.toString());
    return profile?.[1]?.name || 'Deleted user';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (score >= 60) return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  };

  // Compute per-activity points from stored KPI tally (only 5 visible activities)
  const getActivityScore = (submission: Submission, activityKey: string) => {
    const activity = ACTIVITIES.find(a => a.key === activityKey);
    if (!activity) return 0;

    return submission.kpi[activity.kpiTallyKey] || 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No submissions found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">KepSek</TableHead>
            <TableHead className="min-w-[100px]">Date</TableHead>
            {ACTIVITIES.map((activity) => {
              const label = getActivityLabel(activity.key, weights);
              return (
                <TableHead key={activity.key} className="text-center min-w-[80px]">
                  {label}
                </TableHead>
              );
            })}
            <TableHead className="text-center min-w-[100px]">Total KPI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            // Calculate total KPI from only the 5 visible activities
            const totalKPI = 
              item.submission.kpi.energy +
              item.submission.kpi.flow +
              item.submission.kpi.focus +
              item.submission.kpi.health +
              item.submission.kpi.habit;

            return (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {getPrincipalName(item.principal)}
                </TableCell>
                <TableCell>{item.submission.account}</TableCell>
                {ACTIVITIES.map((activity) => {
                  const score = getActivityScore(item.submission, activity.key);
                  return (
                    <TableCell key={activity.key} className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {score.toFixed(1)}
                      </Badge>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  <Badge className={getScoreColor(totalKPI)}>
                    {totalKPI.toFixed(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
