import { useState } from 'react';
import { useAddSubmission, useGetSubmissions, useGetKPIConfig } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import KPIScoreBadge from '../components/kpi/KPIScoreBadge';
import DailyActivityWeightsCard from '../components/kpi/DailyActivityWeightsCard';
import { ACTIVITIES, computeKPIPreview, getActivityPoints, getActivityLabel } from '../lib/kpi';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dedication } from '../backend';

export default function PrincipalDailyFormPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState<Record<string, boolean>>({
    activity1: false,
    activity2: false,
    activity3: false,
    activity4: false,
    activity5: false,
  });

  const addSubmission = useAddSubmission();
  const { data: submissions } = useGetSubmissions();
  const { data: kpiConfig, isLoading: kpiConfigLoading } = useGetKPIConfig();

  const kpiPreview = computeKPIPreview(activities, kpiConfig);
  const activityPoints = getActivityPoints(kpiConfig);

  const handleActivityToggle = (key: string) => {
    setActivities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map the 5 visible activities to backend fields
    // The 6th field (dedication) is always submitted as neutral/disabled
    const report = {
      time: BigInt(0),
      strats: 'Daily activities',
      energy: activities.activity1 ? 'Completed' : 'Not completed',
      energyRating: activities.activity1 ? 1 : 0,
      flow: activities.activity2 ? 'Completed' : 'Not completed',
      flowRating: activities.activity2 ? 1 : 0,
      focus: activities.activity3 ? 'Completed' : 'Not completed',
      focusRating: activities.activity3 ? 1 : 0,
      health: activities.activity4 ? 'Completed' : 'Not completed',
      healthRating: activities.activity4 ? 1 : 0,
      habit: activities.activity5 ? 'Completed' : 'Not completed',
      habitRating: activities.activity5 ? 1 : 0,
      // Removed activity: always submit as neutral (0 rating)
      dedication: 'Not applicable',
      dedicationRating: 0,
      dedicationMetric: Dedication.leadership,
    };

    try {
      await addSubmission.mutateAsync({
        report,
        review: `Daily submission for ${selectedDate}`,
        account: selectedDate,
        reflection: 'Daily activities completed',
        relation: 1,
        rating: kpiPreview.total / 100,
      });

      toast.success('Daily activities submitted successfully!');
      // Reset only the 5 visible activities
      setActivities({
        activity1: false,
        activity2: false,
        activity3: false,
        activity4: false,
        activity5: false,
      });
    } catch (error) {
      toast.error('Failed to submit activities. Please try again.');
    }
  };

  const todaySubmissions = submissions?.filter((s) => s.account === selectedDate) || [];
  const hasSubmittedToday = todaySubmissions.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Daily Activity Form</h2>
        <p className="text-muted-foreground mt-2">
          Record your daily activities to track performance
        </p>
      </div>

      {hasSubmittedToday && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">
            You have already submitted activities for {selectedDate}. Submitting again will add a new entry.
          </AlertDescription>
        </Alert>
      )}

      <DailyActivityWeightsCard
        weights={kpiConfig || null}
        isLoading={kpiConfigLoading}
        isEditable={false}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Select Date
          </CardTitle>
          <CardDescription>Choose the date for your activity report</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Daily Activities</CardTitle>
          <CardDescription>Check off the activities you completed today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {ACTIVITIES.map((activity) => {
                const label = getActivityLabel(activity.key, kpiConfig);
                const description = (kpiConfig?.[activity.nameKey] as string) || activity.description;
                
                return (
                  <div key={activity.key} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id={activity.key}
                      checked={activities[activity.key]}
                      onCheckedChange={() => handleActivityToggle(activity.key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={activity.key}
                        className="text-base font-medium cursor-pointer"
                      >
                        {label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {activityPoints[activity.key].toFixed(2)} points
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t">
              <KPIScoreBadge kpi={kpiPreview} weights={kpiConfig || null} />
            </div>

            {addSubmission.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to submit activities. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              size="lg"
              disabled={addSubmission.isPending}
            >
              {addSubmission.isPending ? 'Submitting...' : 'Submit Daily Activities'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
