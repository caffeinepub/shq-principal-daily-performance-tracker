import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedScreen() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access this page
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
