'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader as Loader2,
  Shield,
  User,
  Trash2,
  Search,
  Users as UsersIcon,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'student';
  is_approved: boolean;
  created_at: string;
  user_id: string;
}

export default function UsersSection() {
  const supabase = createClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Attempt 1: Use the get_all_users() RPC function (returns email + name from auth.users)
      let rows: UserRow[] = [];
      let rpcFailed = false;
      try {
        const { data, error } = await (supabase as any)
          .rpc('get_all_users');

        if (error) {
          console.warn('get_all_users RPC failed, falling back to direct query:', error);
          rpcFailed = true;
        } else {
          rows = (data || []).map((r: any) => ({
            id: r.user_id,
            user_id: r.user_id,
            email: r.email || '',
            full_name: r.full_name || '',
            role: r.role,
            is_approved: r.is_approved ?? false,
            created_at: r.created_at,
          }));
        }
      } catch (rpcErr) {
        console.warn('get_all_users RPC exception, falling back:', rpcErr);
        rpcFailed = true;
      }

      // Attempt 2: Fallback — direct query if RPC missing / failed.
      // Pulls names/emails from student_profiles (admins without a
      // profile rows fall back to empty email/name.
      if (rpcFailed) {
        const {
          data: rolesData,
          error: rolesError,
        } = await (supabase as any)
          .from('user_roles')
          .select(`
            *,
            student_profiles (
              email,
              full_name,
              is_approved
            )
          `)
          .order('created_at', { ascending: false });

        if (rolesError) throw rolesError;

        rows = (rolesData || []).map((r: any) => {
          const profile = Array.isArray(r.student_profiles)
            ? r.student_profiles[0]
            : r.student_profiles;
          const email = profile?.email || '';
          const full_name = profile?.full_name || '';
          const is_approved =
            profile?.is_approved ?? r.role === 'admin';
          return {
            id: r.user_id,
            user_id: r.user_id,
            email,
            full_name,
            role: r.role,
            is_approved,
            created_at: r.created_at,
          };
        });
      }

      setUsers(rows);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? `Failed to load users: ${error.message}`
            : 'Failed to load users.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'student') => {
    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Role Updated',
        description: `User role changed to ${newRole}.`,
      });

      await loadUsers();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('student_profiles')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'User Approved',
        description: 'The user can now access restricted features.',
      });

      await loadUsers();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to approve user.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeApproval = async (userId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('student_profiles')
        .update({ is_approved: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Approval Revoked',
        description: 'The user no longer has access to restricted features.',
      });

      await loadUsers();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to revoke approval.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.user_id === currentUser?.id) {
      toast({
        title: 'Cannot Delete',
        description: 'You cannot delete your own account.',
        variant: 'destructive',
      });
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: roleError } = await (supabase as any)
        .from('user_roles')
        .delete()
        .eq('user_id', deleteTarget.user_id);

      if (roleError) throw roleError;

      const { error: profileError } = await (supabase as any)
        .from('student_profiles')
        .delete()
        .eq('user_id', deleteTarget.user_id);

      if (profileError) {
        console.error('Profile delete error:', profileError);
      }

      toast({
        title: 'User Deleted',
        description: 'The user has been removed from the system.',
      });

      setShowDeleteDialog(false);
      setDeleteTarget(null);
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. You may need to remove them from Supabase Auth directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (user: UserRow) => {
    setDeleteTarget(user);
    setShowDeleteDialog(true);
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      u.full_name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' ? u.is_approved === true : u.is_approved === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const studentCount = users.filter((u) => u.role === 'student').length;
  const pendingCount = users.filter((u) => !u.is_approved).length;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const inputClass = 'border-blue-100 focus:border-blue-400 focus:ring-blue-400';

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-blue-100">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <UsersIcon className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-100">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Shield className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-100">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <User className="h-5 w-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs text-gray-500">Pending Approval</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-blue-900">User Management</CardTitle>
          <CardDescription>
            View, manage, and control access for all registered users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="user-search" className="text-xs text-gray-500">
                Search
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="user-search"
                  type="text"
                  placeholder="Name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Filter by Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className={`${inputClass} mt-1`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`${inputClass} mt-1`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Clear Filters
              </Button>
              <span className="text-sm text-gray-500">
                {filteredUsers.length} of {users.length} users
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-blue-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-blue-100 bg-blue-50">
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-blue-50 hover:bg-yellow-50/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {u.role === 'admin' ? (
                          <Shield className="h-4 w-4 text-purple-600" />
                        ) : (
                          <User className="h-4 w-4 text-blue-600" />
                        )}
                        <span>{u.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {u.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {u.email}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleRoleChange(u.user_id, v as 'admin' | 'student')}
                        disabled={isSubmitting || u.user_id === currentUser?.id}
                      >
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_approved ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {!u.is_approved && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveUser(u.user_id)}
                            disabled={isSubmitting}
                            className="h-8 bg-green-600 px-2.5 text-xs text-white hover:bg-green-700"
                          >
                            <CheckCircle className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                        )}
                        {u.is_approved && u.role === 'student' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeApproval(u.user_id)}
                            disabled={isSubmitting}
                            className="h-8 border-yellow-200 px-2.5 text-xs text-yellow-700 hover:bg-yellow-50"
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Revoke
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => confirmDelete(u)}
                          disabled={isSubmitting || u.user_id === currentUser?.id}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {deleteTarget?.full_name || deleteTarget?.email || 'this user'}
              </span>
              ? This will remove their role and profile data. The auth account
              may need to be removed separately from Supabase Auth.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
