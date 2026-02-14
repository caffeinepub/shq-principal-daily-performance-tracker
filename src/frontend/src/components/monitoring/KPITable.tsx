import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Submission, UserProfile } from '../../backend';
import type { Principal } from '@icp-sdk/core/principal';

interface KPITableProps {
  data: Array<{ principal: Principal; submission: Submission }>;
  profiles: Array<[Principal, UserProfile]>;
  isLoading: boolean;
}

export default function KPITable({ data, profiles, isLoading }: KPITableProps) {
  const getPrincipalName = (principal: Principal) => {
    const profile = profiles.find(([p]) => p.toString() === principal.toString());
    return profile?.[1]?.name || 'Unknown';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (score >= 60) return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
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
            <TableHead>Date</TableHead>
            <TableHead>Principal</TableHead>
            <TableHead className="text-center">Briefing</TableHead>
            <TableHead className="text-center">Supervision</TableHead>
            <TableHead className="text-center">Attendance</TableHead>
            <TableHead className="text-center">Qur'anic Parenting Center</TableHead>
            <TableHead className="text-center">Liqo</TableHead>
            <TableHead className="text-center">Admin</TableHead>
            <TableHead className="text-right">Total KPI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const kpi = item.submission.kpi;
            const total = kpi.energy + kpi.flow + kpi.focus + kpi.health + kpi.habit + kpi.dedication;

            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.submission.account}</TableCell>
                <TableCell>{getPrincipalName(item.principal)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{kpi.energy.toFixed(1)}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{kpi.flow.toFixed(1)}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{kpi.focus.toFixed(1)}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{kpi.health.toFixed(1)}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{kpi.habit.toFixed(1)}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{kpi.dedication.toFixed(1)}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={getScoreColor(total)}>
                    {total.toFixed(1)}
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
