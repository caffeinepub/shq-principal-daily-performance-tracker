import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCallerUserRole, useIsCallerAdmin } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClipboardCheck, LogOut, User, BarChart3, LogIn, LogOut as LogOutIcon, Settings } from 'lucide-react';
import { SiCoffeescript } from 'react-icons/si';
import { UserRole } from '../../backend';
import { getSpecificRoleLabel } from '../../utils/roleLabels';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: role } = useGetCallerUserRole();
  const { data: isAdmin } = useIsCallerAdmin();

  const currentPath = routerState.location.pathname;

  const handleSignOut = async () => {
    await clear();
    queryClient.clear();
  };

  // Determine if user is Director (admin role with full permissions)
  const isDirector = role === UserRole.admin && isAdmin === true;
  const isManagement = role === UserRole.admin && !isDirector;
  const isKepSek = role === UserRole.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SHQ KepSek Tracker</h1>
                <p className="text-xs text-muted-foreground">Daily Performance System</p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              {isKepSek && (
                <>
                  <Button
                    variant={currentPath === '/' ? 'default' : 'ghost'}
                    onClick={() => navigate({ to: '/' })}
                    className={currentPath === '/' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : ''}
                    size="sm"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Check-In
                  </Button>
                  <Button
                    variant={currentPath === '/daily-activities' ? 'default' : 'ghost'}
                    onClick={() => navigate({ to: '/daily-activities' })}
                    className={currentPath === '/daily-activities' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : ''}
                    size="sm"
                  >
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Daily Activities
                  </Button>
                  <Button
                    variant={currentPath === '/check-out' ? 'default' : 'ghost'}
                    onClick={() => navigate({ to: '/check-out' })}
                    className={currentPath === '/check-out' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : ''}
                    size="sm"
                  >
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Check-Out
                  </Button>
                </>
              )}

              {(isDirector || isManagement) && (
                <Button
                  variant={currentPath === '/monitoring' ? 'default' : 'ghost'}
                  onClick={() => navigate({ to: '/monitoring' })}
                  className={currentPath === '/monitoring' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : ''}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Monitoring
                </Button>
              )}

              {isDirector && (
                <Button
                  variant={currentPath === '/user-settings' ? 'default' : 'ghost'}
                  onClick={() => navigate({ to: '/user-settings' })}
                  className={currentPath === '/user-settings' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : ''}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  User Settings
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {getSpecificRoleLabel(isDirector, isManagement)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SHQ KepSek Tracker. All rights reserved.
            </p>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Built with <SiCoffeescript className="w-4 h-4 text-emerald-600" /> using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
