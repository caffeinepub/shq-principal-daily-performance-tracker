import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCallerUserRole } from './hooks/useQueries';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import PrincipalCheckInPage from './pages/PrincipalCheckInPage';
import PrincipalDailyFormPage from './pages/PrincipalDailyFormPage';
import PrincipalCheckOutPage from './pages/PrincipalCheckOutPage';
import MonitoringDashboardPage from './pages/MonitoringDashboardPage';
import UserSettingsPage from './pages/UserSettingsPage';
import RoleGate from './components/auth/RoleGate';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { UserRole } from './backend';

const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (showProfileSetup) {
    return <ProfileSetupDialog />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

const checkInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    return (
      <RoleGate allowedRoles={[UserRole.user]}>
        <PrincipalCheckInPage />
      </RoleGate>
    );
  },
});

const dailyActivitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily-activities',
  component: () => {
    return (
      <RoleGate allowedRoles={[UserRole.user]}>
        <PrincipalDailyFormPage />
      </RoleGate>
    );
  },
});

const checkOutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/check-out',
  component: () => {
    return (
      <RoleGate allowedRoles={[UserRole.user]}>
        <PrincipalCheckOutPage />
      </RoleGate>
    );
  },
});

const monitoringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monitoring',
  component: () => {
    return (
      <RoleGate allowedRoles={[UserRole.admin]}>
        <MonitoringDashboardPage />
      </RoleGate>
    );
  },
});

const userSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user-settings',
  component: () => {
    return (
      <RoleGate allowedRoles={[UserRole.admin]} requireDirector>
        <UserSettingsPage />
      </RoleGate>
    );
  },
});

const routeTree = rootRoute.addChildren([
  checkInRoute,
  dailyActivitiesRoute,
  checkOutRoute,
  monitoringRoute,
  userSettingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
