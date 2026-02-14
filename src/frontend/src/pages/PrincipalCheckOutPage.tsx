import { useState } from 'react';
import { useAddCheckOut, useGetCheckOuts } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime, formatRelativeTime } from '../utils/time';

export default function PrincipalCheckOutPage() {
  const [detail, setDetail] = useState('');
  const addCheckOut = useAddCheckOut();
  const { data: checkOuts, isLoading } = useGetCheckOuts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addCheckOut.mutateAsync(detail);
      toast.success('Check-out submitted successfully!');
      setDetail('');
    } catch (error) {
      toast.error('Failed to submit check-out. Please try again.');
    }
  };

  const sortedCheckOuts = checkOuts ? [...checkOuts].sort((a, b) => Number(b.time - a.time)) : [];
  const mostRecent = sortedCheckOuts[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Check-Out</h2>
        <p className="text-muted-foreground mt-2">
          Record your departure time for the day
        </p>
      </div>

      {mostRecent && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">
            Last check-out: {formatRelativeTime(mostRecent.time)} ({formatDateTime(mostRecent.time)})
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-emerald-600" />
            Submit Check-Out
          </CardTitle>
          <CardDescription>Record your departure with optional notes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="detail">Notes (Optional)</Label>
              <Textarea
                id="detail"
                placeholder="Add any notes about your departure..."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                The check-out time will be recorded automatically by the server
              </p>
            </div>

            {addCheckOut.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to submit check-out. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              size="lg"
              disabled={addCheckOut.isPending}
            >
              {addCheckOut.isPending ? 'Submitting...' : 'Submit Check-Out'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Check-Out History
          </CardTitle>
          <CardDescription>Your recent check-out records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading history...
            </div>
          ) : sortedCheckOuts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No check-out records yet. Submit your first check-out above.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedCheckOuts.slice(0, 10).map((checkOut, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 rounded-lg border bg-accent/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {formatDateTime(checkOut.time)}
                    </div>
                    {checkOut.detail && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {checkOut.detail}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatRelativeTime(checkOut.time)}
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
