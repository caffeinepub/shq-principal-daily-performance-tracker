import { useState } from 'react';
import { useGetAllSubmissions, useGetAllUserProfiles, useGetAllCheckIns, useGetAllCheckOuts } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KPITable from '../components/monitoring/KPITable';
import { BarChart3, Users, TrendingUp, LogIn, LogOut } from 'lucide-react';
import { formatDateTime } from '../utils/time';
import type { Principal } from '@icp-sdk/core/principal';

export default function MonitoringDashboardPage() {
  const [selectedPrincipal, setSelectedPrincipal] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: allSubmissions, isLoading: submissionsLoading } = useGetAllSubmissions();
  const { data: allProfiles, isLoading: profilesLoading } = useGetAllUserProfiles();
  const { data: allCheckIns, isLoading: checkInsLoading } = useGetAllCheckIns();
  const { data: allCheckOuts, isLoading: checkOutsLoading } = useGetAllCheckOuts();

  const isLoading = submissionsLoading || profilesLoading;

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

  // Calculate statistics
  const totalSubmissions = filteredSubmissions.length;
  const uniquePrincipals = new Set(filteredSubmissions.map((s) => s.principal.toString())).size;
  const averageKPI = filteredSubmissions.length > 0
    ? filteredSubmissions.reduce((sum, s) => {
        const kpi = s.submission.kpi;
        const total = kpi.energy + kpi.flow + kpi.focus + kpi.health + kpi.habit + kpi.dedication;
        return sum + total;
      }, 0) / filteredSubmissions.length
    : 0;

  const getPrincipalName = (principal: Principal) => {
    const profile = allProfiles?.find(([p]) => p.toString() === principal.toString());
    return profile?.[1]?.name || 'Unknown';
  };

  // Flatten check-ins and check-outs for display
  const allCheckInsList = allCheckIns?.flatMap(([principal, checkIns]) =>
    checkIns.map((checkIn) => ({ principal, checkIn }))
  ).sort((a, b) => Number(b.checkIn.time - a.checkIn.time)) || [];

  const allCheckOutsList = allCheckOuts?.flatMap(([principal, checkOuts]) =>
    checkOuts.map((checkOut) => ({ principal, checkOut }))
  ).sort((a, b) => Number(b.checkOut.time - a.checkOut.time)) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Performance Monitoring</h2>
        <p className="text-muted-foreground mt-2">
          Track and analyze principal performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Activity reports submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Principals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniquePrincipals}</div>
            <p className="text-xs text-muted-foreground">Principals with submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average KPI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageKPI.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 100 points</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter submissions by date range and principal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal</Label>
              <Select value={selectedPrincipal} onValueChange={setSelectedPrincipal}>
                <SelectTrigger id="principal">
                  <SelectValue placeholder="All Principals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Principals</SelectItem>
                  {allProfiles?.map(([principal, profile]) => (
                    <SelectItem key={principal.toString()} value={principal.toString()}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities">Daily Activities</TabsTrigger>
          <TabsTrigger value="checkins">Check-Ins</TabsTrigger>
          <TabsTrigger value="checkouts">Check-Outs</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>KPI Performance Data</CardTitle>
              <CardDescription>Daily activity completion and performance scores</CardDescription>
            </CardHeader>
            <CardContent>
              <KPITable
                data={filteredSubmissions}
                profiles={allProfiles || []}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkins">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-emerald-600" />
                Check-In Records
              </CardTitle>
              <CardDescription>All principal check-in submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {checkInsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading check-ins...</div>
              ) : allCheckInsList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No check-in records found.</div>
              ) : (
                <div className="space-y-3">
                  {allCheckInsList.slice(0, 20).map((item, index) => (
                    <div key={index} className="flex items-start justify-between p-4 rounded-lg border bg-accent/50">
                      <div className="flex-1">
                        <div className="font-medium">{getPrincipalName(item.principal)}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDateTime(item.checkIn.time)}
                        </div>
                        {item.checkIn.detail && (
                          <p className="text-sm text-muted-foreground mt-2">{item.checkIn.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkouts">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-emerald-600" />
                Check-Out Records
              </CardTitle>
              <CardDescription>All principal check-out submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {checkOutsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading check-outs...</div>
              ) : allCheckOutsList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No check-out records found.</div>
              ) : (
                <div className="space-y-3">
                  {allCheckOutsList.slice(0, 20).map((item, index) => (
                    <div key={index} className="flex items-start justify-between p-4 rounded-lg border bg-accent/50">
                      <div className="flex-1">
                        <div className="font-medium">{getPrincipalName(item.principal)}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDateTime(item.checkOut.time)}
                        </div>
                        {item.checkOut.detail && (
                          <p className="text-sm text-muted-foreground mt-2">{item.checkOut.detail}</p>
                        )}
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
