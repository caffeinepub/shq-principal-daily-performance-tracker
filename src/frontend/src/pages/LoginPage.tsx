import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ClipboardCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">SHQ Principal Tracker</CardTitle>
            <CardDescription className="mt-2">
              Daily Performance Monitoring System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p>Track daily activities and automatically convert them into KPI metrics</p>
            </div>
            <div className="flex items-start gap-3">
              <ClipboardCheck className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <p>Monitor performance across all principals in real-time</p>
            </div>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            size="lg"
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in with Internet Identity'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
