import { useState } from 'react';
import { useGetAllSubmissions, useGetAllUserProfiles, useGetAllCheckIns, useGetAllCheckOuts, useGetKPIConfig, useUpdateKPIConfig, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KPITable from '../components/monitoring/KPITable';
import CheckInPhotoViewer from '../components/checkins/CheckInPhotoViewer';
import DailyActivityWeightsCard from '../components/kpi/DailyActivityWeightsCard';
import { BarChart3, Users, TrendingUp, LogIn, LogOut } from 'lucide-react';
import { formatDateTime } from '../utils/time';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';
import type { KPIConfig } from '../backend';

export default function MonitoringDashboardPage() {
  const [selectedPrincipal, setSelectedPrincipal] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: allSubmissions, isLoading: submissionsLoading } = useGetAllSubmissions();
  const { data: allProfiles, isLoading: profilesLoading } = useGetAllUserProfiles();
  const { data: allCheckIns, isLoading: checkInsLoading } = useGetAllCheckIns();
  const { data: allCheckOuts, isLoading: checkOutsLoading } = useGetAllCheckOuts();
  const { data: kpiConfig, isLoading: kpiConfigLoading } = useGetKPIConfig();
  const { data: isAdmin } = useIsCallerAdmin();
  const updateKPIConfig = useUpdateKPIConfig();

  const isLoading = submissionsLoading || profilesLoading;

  // Helper to get principal name with "Deleted user" fallback
  const getPrincipalName = (principal: Principal) => {
    const profile = allProfiles?.find(([p]) => p.toString() === principal.toString());
    return profile?.[1]?.name || 'Deleted user';
  };

  // Filter submissions
  const filteredSubmissions = allSubmissions?.filter(([principal, submissions]) => {
    if (selectedPrincipal !== 'all' && principal.toString() !== selectedPrincipal) {
      return false;
    }
    return true;
  }).flatMap(([principal, submissions]) =>
    submissions
      .filter((s) => {
        if (startDate && s.account < startDate) return false;
        if (endDate && s.account > endDate) return false;
        return true;
      })
      .map((s) => ({ principal, submission: s }))
  ) || [];

  // Calculate statistics (only 5 visible activities)
  const totalSubmissions = filteredSubmissions.length;
  const uniquePrincipals = new Set(filteredSubmissions.map((s) => s.principal.toString())).size;
  const averageKPI = filteredSubmissions.length > 0
    ? filteredSubmissions.reduce((sum, item) => {
        const kpi = item.submission.kpi;
        // Sum only the 5 visible activities (exclude dedication)
        return sum + kpi.energy + kpi.flow + kpi.focus + kpi.health + kpi.habit;
      }, 0) / filteredSubmissions.length
    : 0;

  // Get unique principals for filter dropdown (only those with profiles)
  const uniquePrincipalsList = allProfiles?.map(([principal, profile]) => ({
    principal: principal.toString(),
    name: profile.name,
  })) || [];

  // Filter check-ins and check-outs
  const filteredCheckIns = allCheckIns?.filter(([principal]) => {
    if (selectedPrincipal !== 'all' && principal.toString() !== selectedPrincipal) {
      return false;
    }
    return true;
  }).flatMap(([principal, checkIns]) =>
    checkIns.map((checkIn) => ({ principal, checkIn }))
  ) || [];

  const filteredCheckOuts = allCheckOuts?.filter(([principal]) => {
    if (selectedPrincipal !== 'all' && principal.toString() !== selectedPrincipal) {
      return false;
    }
    return true;
  }).flatMap(([principal, checkOuts]) =>
    checkOuts.map((checkOut) => ({ principal, checkOut }))
  ) || [];

  const handleSaveWeights = async (newConfig: KPIConfig) => {
    try {
      await updateKPIConfig.mutateAsync(newConfig);
      toast.success('KPI weights updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update KPI weights.');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Monitoring Dashboard</h1>
        <p className="text-muted-foreground">
          Track KPI performance, check-ins, and check-outs across all KepSeks
        </p>
      </div>

      {/* KPI Weights Configuration (Admin/Director only) */}
      {isAdmin && (
        <DailyActivityWeightsCard
          weights={kpiConfig || null}
          isLoading={kpiConfigLoading}
          isEditable={true}
          onSave={handleSaveWeights}
          isSaving={updateKPIConfig.isPending}
        />
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter data by KepSek and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal-filter">KepSek</Label>
              <Select value={selectedPrincipal} onValueChange={setSelectedPrincipal}>
                <SelectTrigger id="principal-filter">
                  <SelectValue placeholder="Select KepSek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KepSeks</SelectItem>
                  {uniquePrincipalsList.map((item) => (
                    <SelectItem key={item.principal} value={item.principal}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Daily activity reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active KepSeks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniquePrincipals}</div>
            <p className="text-xs text-muted-foreground">
              With submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average KPI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageKPI.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Across all activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="kpi" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kpi">KPI Performance</TabsTrigger>
          <TabsTrigger value="checkins">Check-Ins</TabsTrigger>
          <TabsTrigger value="checkouts">Check-Outs</TabsTrigger>
        </TabsList>

        <TabsContent value="kpi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity KPI Scores</CardTitle>
              <CardDescription>
                Performance breakdown by activity type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KPITable
                data={filteredSubmissions}
                profiles={allProfiles || []}
                weights={kpiConfig || null}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Check-In Records
              </CardTitle>
              <CardDescription>
                {filteredCheckIns.length} check-in{filteredCheckIns.length !== 1 ? 's' : ''} recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCheckIns.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No check-ins found for the selected filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCheckIns.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getPrincipalName(item.principal)}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDateTime(item.checkIn.time)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.checkIn.detail}</p>
                      </div>
                      {item.checkIn.photo && (
                        <CheckInPhotoViewer photo={item.checkIn.photo} timestamp={item.checkIn.time} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Check-Out Records
              </CardTitle>
              <CardDescription>
                {filteredCheckOuts.length} check-out{filteredCheckOuts.length !== 1 ? 's' : ''} recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCheckOuts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No check-outs found for the selected filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCheckOuts.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getPrincipalName(item.principal)}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDateTime(item.checkOut.time)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.checkOut.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
