'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
  Search,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import DynamicCategoryForm from '@/components/ui/dynamic-category-form';

import {
  Admission,
  CATEGORY_LABELS,
  StudentCategory,
} from '@/lib/types';

import {
  fetchAdmissions,
  fetchAdmissionCounts,
  approveAdmission,
  rejectAdmission,
} from '@/lib/data/queries';

interface AdmissionCounts {
  pending: number;
  approved: number;
  rejected: number;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  ...(Object.entries(CATEGORY_LABELS) as [StudentCategory, string][]).map(
    ([value, label]) => ({ value, label })
  ),
];

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getCourseDisplay(admission: Admission): string {
  const parts: string[] = [];
  const cat = admission.category;

  if (cat === 'government_exams') {
    if (admission.exam) parts.push(admission.exam);
  } else if (cat === 'computer_courses') {
    if (admission.computer_course) parts.push(admission.computer_course);
  } else {
    if (admission.course) parts.push(admission.course);
    if (admission.level) parts.push(admission.level);
    if (admission.stream) parts.push(admission.stream);
  }

  return parts.length > 0 ? parts.join(' - ') : '—';
}

function getStatusBadgeVariant(status: Admission['status']) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }
}

function getCategoryBadgeClass(category: StudentCategory | null) {
  switch (category) {
    case 'government_exams':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'nios':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'open_schooling':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'computer_courses':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export default function AdmissionsSection() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [counts, setCounts] = useState<AdmissionCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [countsLoading, setCountsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState('');

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(
    null
  );

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionAdmissionId, setActionAdmissionId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAdmissions();
      setAdmissions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load admissions';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      setCountsLoading(true);
      const result = await fetchAdmissionCounts();
      setCounts(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load counts';
      toast.error(message);
    } finally {
      setCountsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadCounts();
  }, [loadData, loadCounts]);

  const filteredAdmissions = admissions.filter((admission) => {
    const matchesSearch =
      !searchQuery ||
      admission.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.phone?.includes(searchQuery) ||
      admission.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.exam?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.computer_course?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || admission.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' || admission.status === statusFilter;

    const matchesCourse =
      !courseFilter ||
      admission.exam?.toLowerCase().includes(courseFilter.toLowerCase()) ||
      admission.computer_course?.toLowerCase().includes(courseFilter.toLowerCase()) ||
      admission.course?.toLowerCase().includes(courseFilter.toLowerCase()) ||
      admission.level?.toLowerCase().includes(courseFilter.toLowerCase()) ||
      admission.stream?.toLowerCase().includes(courseFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesStatus && matchesCourse;
  });

  const handleView = (admission: Admission) => {
    setSelectedAdmission(admission);
    setViewDialogOpen(true);
  };

  const handleApproveClick = (id: string) => {
    setActionAdmissionId(id);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (id: string) => {
    setActionAdmissionId(id);
    setRejectDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!actionAdmissionId) return;
    try {
      setActionLoading(true);
      const enrollmentNumber = await approveAdmission(actionAdmissionId);
      toast.success(
        enrollmentNumber
          ? `Admission approved! Enrollment Number: ${enrollmentNumber}`
          : 'Admission approved successfully!'
      );
      setApproveDialogOpen(false);
      setActionAdmissionId(null);
      await Promise.all([loadData(), loadCounts()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve admission';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!actionAdmissionId) return;
    try {
      setActionLoading(true);
      await rejectAdmission(actionAdmissionId);
      toast.success('Admission rejected successfully!');
      setRejectDialogOpen(false);
      setActionAdmissionId(null);
      await Promise.all([loadData(), loadCounts()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject admission';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const buildViewInitialData = () => {
    if (!selectedAdmission) return undefined;
    const a = selectedAdmission;
    return {
      category: (a.category as StudentCategory) || '',
      full_name: a.student_name || '',
      email: a.email || '',
      phone: a.phone || '',
      date_of_birth: a.date_of_birth || '',
      parent_name: a.parent_name || '',
      parent_phone: a.parent_phone || '',
      address: a.address || '',
      exam: a.exam || '',
      level: a.level || '',
      stream: a.stream || '',
      session: a.session || '',
      batch: a.batch || '',
      batch_timing: a.batch_timing || '',
      duration: a.duration || '',
      computer_course: a.computer_course || '',
      subjects: a.subjects || [],
    };
  };

  return (
    <div className="space-y-6">
      {/* STAT COUNT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90">Pending</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">
                  {countsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-white/80" />
                  ) : (
                    counts.pending
                  )}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <Clock className="h-7 w-7" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md">
          <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90">Approved</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">
                  {countsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-white/80" />
                  ) : (
                    counts.approved
                  )}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <CheckCircle2 className="h-7 w-7" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md">
          <div className="bg-gradient-to-br from-rose-400 via-red-500 to-red-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90">Rejected</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">
                  {countsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-white/80" />
                  ) : (
                    counts.rejected
                  )}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <XCircle className="h-7 w-7" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* FILTERS BAR */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="search-input" className="text-xs font-medium text-gray-600">
                Global Search
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search-input"
                  placeholder="Search name, email, phone, course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-filter" className="text-xs font-medium text-gray-600">
                Category
              </Label>
              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v)}
              >
                <SelectTrigger id="category-filter" className="h-10">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status-filter" className="text-xs font-medium text-gray-600">
                Status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v)}
              >
                <SelectTrigger id="status-filter" className="h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="course-filter" className="text-xs font-medium text-gray-600">
                Course / Exam
              </Label>
              <Input
                id="course-filter"
                placeholder="Filter by exam or course..."
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700 whitespace-nowrap">
                  Student
                </th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700 whitespace-nowrap">
                  Category
                </th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700 whitespace-nowrap">
                  Course / Exam
                </th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700 whitespace-nowrap">
                  Phone
                </th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700 whitespace-nowrap">
                  Date
                </th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700 whitespace-nowrap">
                  Status
                </th>
                <th className="text-left px-6 py-3.5 font-semibold text-gray-700 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-3 text-sm text-gray-500">Loading admissions...</p>
                  </td>
                </tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-700">
                      No admissions found
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Try adjusting the filters or search query
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((admission) => (
                  <tr
                    key={admission.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {admission.student_name || '—'}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {admission.email || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${getCategoryBadgeClass(admission.category)} border`}
                      >
                        {admission.category
                          ? CATEGORY_LABELS[admission.category]
                          : '—'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {getCourseDisplay(admission)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {admission.phone || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {formatDate(admission.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${getStatusBadgeVariant(admission.status)} border capitalize`}
                      >
                        {admission.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => handleView(admission)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Button>
                        {admission.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApproveClick(admission.id)}
                          >
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                            Approve
                          </Button>
                        )}
                        {admission.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleRejectClick(admission.id)}
                          >
                            <X className="mr-1.5 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW DIALOG */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Admission Details</DialogTitle>
            <DialogDescription>
              Complete application information for{' '}
              <span className="font-medium text-gray-800">
                {selectedAdmission?.student_name}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedAdmission && (
            <div className="space-y-6 py-2">
              {/* Section 1: Personal Info Card */}
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                    <span className="w-1.5 h-5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Full Name
                      </p>
                      <p className="mt-1 text-sm text-gray-900 font-medium">
                        {selectedAdmission.student_name || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAdmission.email || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Phone
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAdmission.phone || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Date of Birth
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAdmission.date_of_birth
                          ? formatDate(selectedAdmission.date_of_birth)
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Parent / Guardian Name
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAdmission.parent_name || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Parent / Guardian Phone
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAdmission.parent_phone || '—'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Address
                      </p>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedAdmission.address || '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Category-specific Info via DynamicCategoryForm */}
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                    <span className="w-1.5 h-5 bg-gradient-to-b from-emerald-600 to-green-600 rounded-full" />
                    Course & Category Information
                  </h3>
                  <DynamicCategoryForm
                    mode="view"
                    initialData={buildViewInitialData()}
                    compact
                  />
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* APPROVE CONFIRMATION */}
      <AlertDialog
        open={approveDialogOpen}
        onOpenChange={(o) => !actionLoading && setApproveDialogOpen(o)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              Approve Admission
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the admission application and automatically generate
              an enrollment number for the student. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmApprove();
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Yes, Approve
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* REJECT CONFIRMATION */}
      <AlertDialog
        open={rejectDialogOpen}
        onOpenChange={(o) => !actionLoading && setRejectDialogOpen(o)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              Reject Admission
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this admission application?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmReject();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Yes, Reject
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
