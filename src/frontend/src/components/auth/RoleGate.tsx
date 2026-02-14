import { useGetCallerUserRole } from '../../hooks/useQueries';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Loader2 } from 'lucide-react';
import { UserRole } from '../../backend';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const { data: role, isLoading } = useGetCallerUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
