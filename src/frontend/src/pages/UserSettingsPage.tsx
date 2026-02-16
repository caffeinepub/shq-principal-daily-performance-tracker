import { useState } from 'react';
import { useListUsersWithRoles, useUpdateUserRole, useDeleteUser } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Users, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRole, type UserWithRole } from '../backend';
import { toast } from 'sonner';
import { getRoleLabel, ROLE_LABELS } from '../utils/roleLabels';

export default function UserSettingsPage() {
  const { data: users, isLoading, error } = useListUsersWithRoles();
  const updateRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const handleRoleChange = (principalString: string, newRole: UserRole) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [principalString]: newRole,
    }));
  };

  const handleUpdateRole = async (user: UserWithRole) => {
    const principalString = user.principal.toString();
    const newRole = selectedRoles[principalString];

    if (!newRole || newRole === user.role) {
      toast.error('Please select a different role to update');
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        user: user.principal,
        newRole,
      });
      toast.success(`Successfully updated role for ${user.profile?.name || principalString}`);
      // Clear the selection after successful update
      setSelectedRoles((prev) => {
        const updated = { ...prev };
        delete updated[principalString];
        return updated;
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (user: UserWithRole) => {
    const principalString = user.principal.toString();
    setDeletingUser(principalString);

    try {
      await deleteUserMutation.mutateAsync(user.principal);
      toast.success(`Successfully deleted user ${user.profile?.name || principalString}`);
      setDeletingUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
      setDeletingUser(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case UserRole.admin:
        return 'default';
      case UserRole.user:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
          <p className="text-muted-foreground">Loading user settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load user settings. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Settings
            </CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found in the system.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">User Settings</h1>
        <p className="text-muted-foreground">
          Manage user roles and permissions. You can change existing users' roles or delete user accounts while preserving historical data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
          <CardDescription>
            {users.length} {users.length === 1 ? 'user' : 'users'} in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>New Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const principalString = user.principal.toString();
                  const selectedRole = selectedRoles[principalString];
                  const isUpdating = updateRoleMutation.isPending;
                  const isDeleting = deletingUser === principalString;
                  const isRoleChanged = selectedRole && selectedRole !== user.role;

                  return (
                    <TableRow key={principalString}>
                      <TableCell className="font-medium">
                        {user.profile?.name || (
                          <span className="text-muted-foreground italic">No profile</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate" title={principalString}>
                        {principalString}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={selectedRole || user.role}
                          onValueChange={(value) => handleRoleChange(principalString, value as UserRole)}
                          disabled={isUpdating || isDeleting}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UserRole.user}>{ROLE_LABELS.KEPSEK}</SelectItem>
                            <SelectItem value={UserRole.admin}>{ROLE_LABELS.DIRECTOR_MANAGEMENT}</SelectItem>
                            <SelectItem value={UserRole.guest}>{ROLE_LABELS.GUEST}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateRole(user)}
                            disabled={!isRoleChanged || isUpdating || isDeleting}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Update Role
                              </>
                            )}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isUpdating || isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the account for{' '}
                                  <strong>{user.profile?.name || principalString}</strong>?
                                  <br />
                                  <br />
                                  This will remove the user's account, but all historical submissions, check-ins, and check-outs will be preserved for monitoring purposes.
                                  <br />
                                  <br />
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
