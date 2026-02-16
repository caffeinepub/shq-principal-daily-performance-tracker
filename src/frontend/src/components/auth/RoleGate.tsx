import { useGetCallerUserRole, useIsCallerAdmin } from '../../hooks/useQueries';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Loader2 } from 'lucide-react';
import { UserRole } from '../../backend';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  requireDirector?: boolean;
}

export default function RoleGate({ allowedRoles, children, requireDirector = false }: RoleGateProps) {
  const { data: role, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isLoading = roleLoading || adminLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Check basic role access
  if (!role || !allowedRoles.includes(role)) {
    return <AccessDeniedScreen />;
  }

  // If Director-only access is required, check isCallerAdmin
  if (requireDirector && isAdmin !== true) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
