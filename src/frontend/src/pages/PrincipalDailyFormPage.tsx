import { useState } from 'react';
import { useAddSubmission, useGetSubmissions } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import KPIScoreBadge from '../components/kpi/KPIScoreBadge';
import { ACTIVITIES, computeKPIPreview } from '../lib/kpi';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dedication } from '../backend';

export default function PrincipalDailyFormPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState<Record<string, boolean>>({
    briefing: false,
    supervision: false,
    attendance: false,
    qpc: false,
    liqo: false,
    administration: false,
  });

  const addSubmission = useAddSubmission();
  const { data: submissions } = useGetSubmissions();

  const kpiPreview = computeKPIPreview(activities);

  const handleActivityToggle = (key: string) => {
    setActivities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use a placeholder timestamp; backend will use server time (Time.now())
    const report = {
      time: BigInt(0),
      strats: 'Daily activities',
      energy: activities.briefing ? 'Completed' : 'Not completed',
      energyRating: activities.briefing ? 1 : 0,
      flow: activities.supervision ? 'Completed' : 'Not completed',
      flowRating: activities.supervision ? 1 : 0,
      focus: activities.attendance ? 'Completed' : 'Not completed',
      focusRating: activities.attendance ? 1 : 0,
      health: activities.qpc ? 'Completed' : 'Not completed',
      healthRating: activities.qpc ? 1 : 0,
      habit: activities.liqo ? 'Completed' : 'Not completed',
      habitRating: activities.liqo ? 1 : 0,
      dedication: activities.administration ? 'Completed' : 'Not completed',
      dedicationRating: activities.administration ? 1 : 0,
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
      setActivities({
        briefing: false,
        supervision: false,
        attendance: false,
        qpc: false,
        liqo: false,
        administration: false,
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
              {ACTIVITIES.map((activity) => (
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
                      {activity.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {activity.points} points
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <KPIScoreBadge kpi={kpiPreview} />
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
