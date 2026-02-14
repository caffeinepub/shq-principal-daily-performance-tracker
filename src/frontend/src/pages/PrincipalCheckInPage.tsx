import { useState } from 'react';
import { useAddCheckIn, useGetCheckIns } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime, formatRelativeTime } from '../utils/time';

export default function PrincipalCheckInPage() {
  const [detail, setDetail] = useState('');
  const addCheckIn = useAddCheckIn();
  const { data: checkIns, isLoading } = useGetCheckIns();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addCheckIn.mutateAsync(detail);
      toast.success('Check-in submitted successfully!');
      setDetail('');
    } catch (error) {
      toast.error('Failed to submit check-in. Please try again.');
    }
  };

  const sortedCheckIns = checkIns ? [...checkIns].sort((a, b) => Number(b.time - a.time)) : [];
  const mostRecent = sortedCheckIns[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Check-In</h2>
        <p className="text-muted-foreground mt-2">
          Record your arrival time for the day
        </p>
      </div>

      {mostRecent && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">
            Last check-in: {formatRelativeTime(mostRecent.time)} ({formatDateTime(mostRecent.time)})
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-emerald-600" />
            Submit Check-In
          </CardTitle>
          <CardDescription>Record your arrival with optional notes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="detail">Notes (Optional)</Label>
              <Textarea
                id="detail"
                placeholder="Add any notes about your arrival..."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                The check-in time will be recorded automatically by the server
              </p>
            </div>

            {addCheckIn.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to submit check-in. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              size="lg"
              disabled={addCheckIn.isPending}
            >
              {addCheckIn.isPending ? 'Submitting...' : 'Submit Check-In'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Check-In History
          </CardTitle>
          <CardDescription>Your recent check-in records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading history...
            </div>
          ) : sortedCheckIns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No check-in records yet. Submit your first check-in above.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedCheckIns.slice(0, 10).map((checkIn, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 rounded-lg border bg-accent/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {formatDateTime(checkIn.time)}
                    </div>
                    {checkIn.detail && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {checkIn.detail}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatRelativeTime(checkIn.time)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
