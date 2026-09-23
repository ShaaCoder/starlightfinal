'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import logo from '@/public/starlight logo.jpeg';
import {
  IndianRupee,
  Plus,
  Search,
  CreditCard,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Receipt,
  User,
  CalendarDays,
  Loader2,
  History,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';

type Student = {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  enrollment_number?: string | null;
  course?: string | null;
};

type Course = {
  id: string;
  title: string;
};

type StudentFee = {
  id: string;
  student_id: string;
  course_id: string | null;

  total_fee: number;
  discount: number;
  final_fee: number;

  paid_amount: number;
  due_amount: number;

  payment_type: 'full' | 'installment' | 'monthly';

  fee_status: 'pending' | 'partial' | 'paid' | 'overdue';

  due_date: string | null;
  notes: string | null;

  created_at: string;
  updated_at: string;

  student?: Student;
  course?: Course | null;
};

type FeePayment = {
  id: string;
  fee_id: string;
  student_id: string;

  amount: number;

  payment_method:
    | 'cash'
    | 'upi'
    | 'card'
    | 'bank_transfer'
    | 'online';

  transaction_id: string | null;
  payment_date: string;
  receipt_number: string | null;
  notes: string | null;

  created_at: string;
};

const emptyFeeForm = {
  student_id: '',
  course_id: '',
  total_fee: '',
  discount: '',
  payment_type: 'full' as 'full' | 'installment' | 'monthly',
  due_date: '',
  notes: '',
};

const emptyPaymentForm = {
  fee_id: '',
  student_id: '',
  amount: '',
  payment_method: 'cash' as
    | 'cash'
    | 'upi'
    | 'card'
    | 'bank_transfer'
    | 'online',
  transaction_id: '',
  payment_date: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function FeeManagement() {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  const [selectedFee, setSelectedFee] =
    useState<StudentFee | null>(null);

  const [selectedPayment, setSelectedPayment] =
    useState<FeePayment | null>(null);

  const [feeForm, setFeeForm] = useState(emptyFeeForm);
  const [paymentForm, setPaymentForm] =
    useState(emptyPaymentForm);

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [
        studentsResponse,
        coursesResponse,
        feesResponse,
        paymentsResponse,
      ] = await Promise.all([
        (supabase.from('student_profiles') as any)
          .select(
            'id, full_name, email, phone, enrollment_number, course'
          )
          .order('full_name', { ascending: true }),

        (supabase.from('courses') as any)
          .select('id, title')
          .order('title', { ascending: true }),

        (supabase.from('student_fees') as any)
          .select(`
            *,
            student:student_profiles(
              id,
              full_name,
              email,
              phone,
              enrollment_number,
              course
            ),
            course:courses(
              id,
              title
            )
          `)
          .order('created_at', { ascending: false }),

        (supabase.from('fee_payments') as any)
          .select('*')
          .order('payment_date', { ascending: false }),
      ]);

      if (studentsResponse.error) {
        throw studentsResponse.error;
      }

      if (coursesResponse.error) {
        throw coursesResponse.error;
      }

      if (feesResponse.error) {
        throw feesResponse.error;
      }

      if (paymentsResponse.error) {
        throw paymentsResponse.error;
      }

      setStudents(studentsResponse.data || []);
      setCourses(coursesResponse.data || []);
      setFees(feesResponse.data || []);
      setPayments(paymentsResponse.data || []);
    } catch (error) {
      console.error('Fee management load error:', error);

      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to load fee data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const totals = useMemo(() => {
    return fees.reduce(
      (acc, fee) => {
        acc.total += Number(fee.final_fee || 0);
        acc.paid += Number(fee.paid_amount || 0);
        acc.due += Number(fee.due_amount || 0);

        if (fee.fee_status === 'overdue') {
          acc.overdue += Number(fee.due_amount || 0);
        }

        return acc;
      },
      {
        total: 0,
        paid: 0,
        due: 0,
        overdue: 0,
      }
    );
  }, [fees]);

  const filteredFees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return fees;
    }

    return fees.filter((fee) => {
      const student = fee.student;

      return (
        student?.full_name?.toLowerCase().includes(query) ||
        student?.email?.toLowerCase().includes(query) ||
        student?.phone?.toLowerCase().includes(query) ||
        student?.enrollment_number
          ?.toLowerCase()
          .includes(query) ||
        student?.course?.toLowerCase().includes(query)
      );
    });
  }, [fees, searchQuery]);

  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const getStatusBadge = (status: StudentFee['fee_status']) => {
    if (status === 'paid') {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Paid
        </Badge>
      );
    }

    if (status === 'partial') {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
          <Clock className="mr-1 h-3.5 w-3.5" />
          Partial
        </Badge>
      );
    }

    if (status === 'overdue') {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          <AlertCircle className="mr-1 h-3.5 w-3.5" />
          Overdue
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        Pending
      </Badge>
    );
  };

  // =========================================================
  // ADD FEE
  // =========================================================

  const handleAddFee = async () => {
    if (!feeForm.student_id) {
      toast({
        title: 'Student Required',
        description: 'Please select a student.',
        variant: 'destructive',
      });
      return;
    }

    const totalFee = Number(feeForm.total_fee || 0);
    const discount = Number(feeForm.discount || 0);

    if (totalFee <= 0) {
      toast({
        title: 'Invalid Fee',
        description: 'Please enter a valid total fee.',
        variant: 'destructive',
      });
      return;
    }

    if (discount > totalFee) {
      toast({
        title: 'Invalid Discount',
        description:
          'Discount cannot be greater than the total fee.',
        variant: 'destructive',
      });
      return;
    }

    const finalFee = totalFee - discount;

    setIsSaving(true);

    try {
      const { error } = await (
        supabase.from('student_fees') as any
      ).insert([
        {
          student_id: feeForm.student_id,
          course_id:
            feeForm.course_id &&
            feeForm.course_id !== 'none'
              ? feeForm.course_id
              : null,

          total_fee: totalFee,
          discount,
          final_fee: finalFee,

          paid_amount: 0,
          due_amount: finalFee,

          payment_type: feeForm.payment_type,
          fee_status: 'pending',

          due_date: feeForm.due_date || null,
          notes: feeForm.notes.trim(),
        },
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: 'Fee Added',
        description:
          'Student fee has been created successfully.',
      });

      setFeeForm(emptyFeeForm);
      setShowFeeDialog(false);

      await loadData();
    } catch (error) {
      console.error('Add fee error:', error);

      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to add fee.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // ADD PAYMENT
  // =========================================================

  const handleAddPayment = async () => {
    if (!paymentForm.fee_id) {
      toast({
        title: 'Fee Required',
        description: 'Please select a fee record.',
        variant: 'destructive',
      });
      return;
    }

    const amount = Number(paymentForm.amount || 0);

    if (amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    const fee = fees.find(
      (item) => item.id === paymentForm.fee_id
    );

    if (!fee) {
      toast({
        title: 'Fee Not Found',
        description: 'The selected fee record was not found.',
        variant: 'destructive',
      });
      return;
    }

    if (amount > Number(fee.due_amount)) {
      toast({
        title: 'Amount Too High',
        description:
          `Maximum payable amount is ${formatCurrency(
            Number(fee.due_amount)
          )}.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const newPaidAmount =
        Number(fee.paid_amount) + amount;

      const newDueAmount =
        Number(fee.final_fee) - newPaidAmount;

      let newStatus:
        | 'pending'
        | 'partial'
        | 'paid'
        | 'overdue';

      if (newDueAmount <= 0) {
        newStatus = 'paid';
      } else if (newPaidAmount > 0) {
        newStatus = 'partial';
      } else {
        newStatus = 'pending';
      }

      // Generate a unique receipt number for this payment.
      const receiptNumber =
        `REC-${new Date(paymentForm.payment_date).getFullYear()}-${crypto
          .randomUUID()
          .slice(0, 8)
          .toUpperCase()}`;

      // Insert payment
      const { error: paymentError } = await (
        supabase.from('fee_payments') as any
      ).insert([
        {
          fee_id: fee.id,
          student_id: fee.student_id,
          amount,

          payment_method:
            paymentForm.payment_method,

          transaction_id:
            paymentForm.transaction_id.trim(),

          payment_date:
            paymentForm.payment_date,

          receipt_number: receiptNumber,

          notes:
            paymentForm.notes.trim(),
        },
      ]);

      if (paymentError) {
        throw paymentError;
      }

      // Update fee
      const { error: feeError } = await (
        supabase.from('student_fees') as any
      )
        .update({
          paid_amount: newPaidAmount,
          due_amount: Math.max(0, newDueAmount),
          fee_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fee.id);

      if (feeError) {
        throw feeError;
      }

      toast({
        title: 'Payment Added',
        description: `${formatCurrency(
          amount
        )} payment recorded successfully.`,
      });

      setPaymentForm(emptyPaymentForm);
      setShowPaymentDialog(false);

      await loadData();
    } catch (error) {
      console.error('Add payment error:', error);

      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to record payment.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // OPEN PAYMENT
  // =========================================================

  const openPaymentDialog = (fee: StudentFee) => {
    setSelectedFee(fee);

    setPaymentForm({
      ...emptyPaymentForm,
      fee_id: fee.id,
      student_id: fee.student_id,
    });

    setShowPaymentDialog(true);
  };

  // =========================================================
  // HISTORY
  // =========================================================

  const openHistory = (fee: StudentFee) => {
    setSelectedFee(fee);
    setShowHistoryDialog(true);
  };

  const selectedPayments = selectedFee
    ? payments.filter(
        (payment) =>
          payment.fee_id === selectedFee.id
      )
    : [];

  const openReceipt = (
    fee: StudentFee,
    payment: FeePayment
  ) => {
    setSelectedFee(fee);
    setSelectedPayment(payment);
    setShowReceiptDialog(true);
  };

  const escapeHtml = (value: unknown) => {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const printReceipt = () => {
    if (!selectedFee || !selectedPayment) return;

    const paymentIndex =
      selectedPayments.findIndex(
        (item) => item.id === selectedPayment.id
      );

    const previousPaid = selectedFee.paid_amount -
      selectedPayment.amount;

    const receiptWindow = window.open(
      '',
      '_blank',
      'width=900,height=900'
    );

    if (!receiptWindow) {
      toast({
        title: 'Popup Blocked',
        description:
          'Please allow popups for this site and try again.',
        variant: 'destructive',
      });
      return;
    }

    const studentName =
      selectedFee.student?.full_name ||
      'Student';

    const courseName =
      selectedFee.course?.title ||
      selectedFee.student?.course ||
      '-';

    const paymentMethod =
      selectedPayment.payment_method
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        );

    const paymentDate = new Date(
      selectedPayment.payment_date
    ).toLocaleDateString('en-IN');

    const receiptNumber =
      selectedPayment.receipt_number ||
      `REC-${new Date(
        selectedPayment.payment_date
      ).getFullYear()}-${selectedPayment.id
        .slice(0, 8)
        .toUpperCase()}`;

    receiptWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(receiptNumber)} - Fee Receipt</title>
          <meta charset="UTF-8" />
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 32px;
              background: #f3f6fb;
              color: #172033;
              font-family: Arial, Helvetica, sans-serif;
            }

            .receipt {
              width: 800px;
              max-width: 100%;
              margin: 0 auto;
              background: white;
              border: 1px solid #dbe4f0;
              border-radius: 18px;
              overflow: hidden;
              box-shadow: 0 8px 30px rgba(15, 23, 42, .08);
            }

            .top {
              padding: 28px 34px 22px;
              background: linear-gradient(135deg, #2563eb, #4f46e5);
              color: white;
            }

            .brand {
              display: flex;
              align-items: center;
              gap: 16px;
            }

            .logo {
              width: 72px;
              height: 72px;
              object-fit: contain;
              background: white;
              border-radius: 12px;
              padding: 6px;
            }

            .academy {
              font-size: 28px;
              font-weight: 800;
              margin-bottom: 4px;
            }

            .subtitle {
              font-size: 13px;
              opacity: .9;
            }

            .receipt-title {
              margin-top: 22px;
              font-size: 20px;
              font-weight: 700;
              letter-spacing: .08em;
            }

            .receipt-meta {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              margin-top: 10px;
              font-size: 13px;
            }

            .section {
              padding: 24px 34px;
            }

            .section-title {
              margin: 0 0 14px;
              color: #1e3a8a;
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: .06em;
            }

            .student-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px 30px;
            }

            .field-label {
              color: #64748b;
              font-size: 11px;
              margin-bottom: 3px;
            }

            .field-value {
              font-size: 14px;
              font-weight: 600;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            td {
              padding: 10px 0;
              border-bottom: 1px solid #e5eaf1;
              font-size: 14px;
            }

            td:last-child {
              text-align: right;
              font-weight: 600;
            }

            .highlight td {
              font-size: 16px;
              font-weight: 800;
              color: #1d4ed8;
              border-bottom: 0;
            }

            .paid-box {
              margin-top: 18px;
              padding: 15px 18px;
              border: 1px solid #bbf7d0;
              background: #f0fdf4;
              border-radius: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
            }

            .paid-label {
              color: #166534;
              font-weight: 700;
            }

            .paid-amount {
              color: #15803d;
              font-size: 22px;
              font-weight: 800;
            }

            .footer {
              padding: 20px 34px 28px;
              border-top: 1px dashed #cbd5e1;
              color: #64748b;
              font-size: 11px;
              text-align: center;
            }

            .signature {
              margin-top: 28px;
              display: flex;
              justify-content: flex-end;
            }

            .signature-line {
              width: 180px;
              padding-top: 28px;
              border-top: 1px solid #94a3b8;
              text-align: center;
              color: #475569;
              font-size: 11px;
            }

            @media print {
              body {
                padding: 0;
                background: white;
              }

              .receipt {
                width: 100%;
                max-width: none;
                border: 0;
                box-shadow: none;
                border-radius: 0;
              }
            }
          </style>
        </head>

        <body>
          <div class="receipt">

            <div class="top">
              <div class="brand">
               <img
  class="logo"
  src="${window.location.origin}${logo.src}"
  alt="Starlight Academy Logo"
/>
                <div>
                  <div class="academy">
                    Starlight Academy
                  </div>

                  <div class="subtitle">
                    Excellence in Education
                  </div>
                </div>
              </div>

              <div class="receipt-title">
                FEE PAYMENT RECEIPT
              </div>

              <div class="receipt-meta">
                <span>
                  Receipt No: <strong>${escapeHtml(receiptNumber)}</strong>
                </span>

                <span>
                  Date: <strong>${escapeHtml(paymentDate)}</strong>
                </span>
              </div>
            </div>

            <div class="section">

              <div class="section-title">
                Student Information
              </div>

              <div class="student-grid">

                <div>
                  <div class="field-label">
                    Student Name
                  </div>

                  <div class="field-value">
                    ${escapeHtml(studentName)}
                  </div>
                </div>

                <div>
                  <div class="field-label">
                    Enrollment Number
                  </div>

                  <div class="field-value">
                    ${escapeHtml(
                      selectedFee.student?.enrollment_number ||
                      '-'
                    )}
                  </div>
                </div>

                <div>
                  <div class="field-label">
                    Course
                  </div>

                  <div class="field-value">
                    ${escapeHtml(courseName)}
                  </div>
                </div>

                <div>
                  <div class="field-label">
                    Payment Method
                  </div>

                  <div class="field-value">
                    ${escapeHtml(paymentMethod)}
                  </div>
                </div>

              </div>

            </div>

            <div class="section">

              <div class="section-title">
                Fee Details
              </div>

              <table>
                <tr>
                  <td>Total Course Fee</td>
                  <td>${escapeHtml(
                    formatCurrency(
                      Number(selectedFee.total_fee)
                    )
                  )}</td>
                </tr>

                <tr>
                  <td>Discount</td>
                  <td>- ${escapeHtml(
                    formatCurrency(
                      Number(selectedFee.discount)
                    )
                  )}</td>
                </tr>

                <tr>
                  <td>Final Fee</td>
                  <td>${escapeHtml(
                    formatCurrency(
                      Number(selectedFee.final_fee)
                    )
                  )}</td>
                </tr>

                <tr>
                  <td>Previous Paid</td>
                  <td>${escapeHtml(
                    formatCurrency(
                      Math.max(0, previousPaid)
                    )
                  )}</td>
                </tr>

                <tr class="highlight">
                  <td>This Payment</td>
                  <td>${escapeHtml(
                    formatCurrency(
                      Number(selectedPayment.amount)
                    )
                  )}</td>
                </tr>

                <tr>
                  <td>Remaining Due</td>
                  <td>${escapeHtml(
                    formatCurrency(
                      Number(selectedFee.due_amount)
                    )
                  )}</td>
                </tr>
              </table>

              <div class="paid-box">
                <div class="paid-label">
                  PAYMENT STATUS
                </div>

                <div class="paid-amount">
                  ${selectedFee.fee_status === 'paid'
                    ? 'PAID'
                    : 'PARTIAL PAYMENT'}
                </div>
              </div>

              ${
                selectedPayment.transaction_id
                  ? `
                    <div style="margin-top:18px;font-size:12px;color:#64748b;">
                      Transaction ID:
                      <strong style="color:#334155;">
                        ${escapeHtml(
                          selectedPayment.transaction_id
                        )}
                      </strong>
                    </div>
                  `
                  : ''
              }

              <div class="signature">
                <div class="signature-line">
                  Authorized Signature
                </div>
              </div>

            </div>

            <div class="footer">
              Thank you for choosing Starlight Academy.
              <br />
              This is a computer-generated fee payment receipt.
            </div>

          </div>

          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    receiptWindow.document.close();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">
            Fee Management
          </h2>

          <p className="text-sm text-gray-500">
            Manage student fees, payments and pending amounts.
          </p>
        </div>

        <Button
          onClick={() => {
            setFeeForm(emptyFeeForm);
            setShowFeeDialog(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Fee
        </Button>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Card className="border-blue-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Fees
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-900">
                  {formatCurrency(totals.total)}
                </p>
              </div>

              <div className="rounded-xl bg-blue-100 p-3">
                <IndianRupee className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Collected
                </p>

                <p className="mt-1 text-2xl font-bold text-green-700">
                  {formatCurrency(totals.paid)}
                </p>
              </div>

              <div className="rounded-xl bg-green-100 p-3">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Pending
                </p>

                <p className="mt-1 text-2xl font-bold text-yellow-700">
                  {formatCurrency(totals.due)}
                </p>
              </div>

              <div className="rounded-xl bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Overdue
                </p>

                <p className="mt-1 text-2xl font-bold text-red-700">
                  {formatCurrency(totals.overdue)}
                </p>
              </div>

              <div className="rounded-xl bg-red-100 p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* SEARCH */}

      <Card className="border-blue-100">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <Input
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search student, email, phone, enrollment..."
              className="pl-9 border-blue-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* FEES TABLE */}

      <Card className="overflow-hidden border-blue-100">

        <CardHeader>
          <CardTitle className="text-blue-900">
            Student Fees
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">

          <div className="overflow-x-auto">

            <table className="min-w-[1000px] w-full text-sm">

              <thead>
                <tr className="border-b bg-blue-50">
                  <th className="px-4 py-3 text-left">
                    Student
                  </th>

                  <th className="px-4 py-3 text-left">
                    Course
                  </th>

                  <th className="px-4 py-3 text-right">
                    Final Fee
                  </th>

                  <th className="px-4 py-3 text-right">
                    Paid
                  </th>

                  <th className="px-4 py-3 text-right">
                    Due
                  </th>

                  <th className="px-4 py-3 text-left">
                    Due Date
                  </th>

                  <th className="px-4 py-3 text-left">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredFees.map((fee) => (

                  <tr
                    key={fee.id}
                    className="border-b border-blue-50 hover:bg-blue-50/40"
                  >

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {fee.student?.full_name ||
                              'Unknown Student'}
                          </p>

                          <p className="text-xs text-gray-500">
                            {fee.student?.enrollment_number ||
                              fee.student?.email ||
                              '-'}
                          </p>
                        </div>

                      </div>

                    </td>

                    <td className="px-4 py-4">
                      {fee.course?.title ||
                        fee.student?.course ||
                        '-'}
                    </td>

                    <td className="px-4 py-4 text-right font-semibold">
                      {formatCurrency(
                        Number(fee.final_fee)
                      )}
                    </td>

                    <td className="px-4 py-4 text-right text-green-700">
                      {formatCurrency(
                        Number(fee.paid_amount)
                      )}
                    </td>

                    <td className="px-4 py-4 text-right font-semibold text-red-600">
                      {formatCurrency(
                        Number(fee.due_amount)
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {fee.due_date
                        ? new Date(
                            fee.due_date
                          ).toLocaleDateString('en-IN')
                        : '-'}
                    </td>

                    <td className="px-4 py-4">
                      {getStatusBadge(
                        fee.fee_status
                      )}
                    </td>

                    <td className="px-4 py-4">

                      <div className="flex justify-end gap-2">

                        {Number(fee.due_amount) > 0 && (
                          <Button
                            size="sm"
                            onClick={() =>
                              openPaymentDialog(fee)
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CreditCard className="mr-1 h-3.5 w-3.5" />
                            Pay
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openHistory(fee)
                          }
                          className="border-blue-200 text-blue-700"
                        >
                          <History className="mr-1 h-3.5 w-3.5" />
                          History
                        </Button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {filteredFees.length === 0 && (
            <div className="py-16 text-center">

              <Wallet className="mx-auto h-10 w-10 text-gray-300" />

              <p className="mt-3 text-gray-500">
                No fee records found.
              </p>

              <Button
                onClick={() => setShowFeeDialog(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Fee
              </Button>

            </div>
          )}

        </CardContent>

      </Card>

      {/* =====================================================
          ADD FEE DIALOG
      ===================================================== */}

      <Dialog
        open={showFeeDialog}
        onOpenChange={setShowFeeDialog}
      >

        <DialogContent className="max-w-2xl">

          <DialogHeader>
            <DialogTitle className="text-blue-900">
              Add Student Fee
            </DialogTitle>

            <DialogDescription>
              Create a fee record for a student.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">

            <div className="space-y-2">

              <Label>Student *</Label>

              <Select
                value={feeForm.student_id}
                onValueChange={(value) =>
                  setFeeForm({
                    ...feeForm,
                    student_id: value,
                  })
                }
              >

                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>

                <SelectContent>

                  {students.map((student) => (
                    <SelectItem
                      key={student.id}
                      value={student.id}
                    >
                      {student.full_name}
                      {student.enrollment_number
                        ? ` — ${student.enrollment_number}`
                        : ''}
                    </SelectItem>
                  ))}

                </SelectContent>

              </Select>

            </div>

            <div className="space-y-2">

              <Label>Course</Label>

              <Select
                value={feeForm.course_id}
                onValueChange={(value) =>
                  setFeeForm({
                    ...feeForm,
                    course_id: value,
                  })
                }
              >

                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="none">
                    No Course
                  </SelectItem>

                  {courses.map((course) => (
                    <SelectItem
                      key={course.id}
                      value={course.id}
                    >
                      {course.title}
                    </SelectItem>
                  ))}

                </SelectContent>

              </Select>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="space-y-2">

                <Label>Total Fee *</Label>

                <Input
                  type="number"
                  min="0"
                  value={feeForm.total_fee}
                  onChange={(e) =>
                    setFeeForm({
                      ...feeForm,
                      total_fee: e.target.value,
                    })
                  }
                  placeholder="e.g. 10000"
                />

              </div>

              <div className="space-y-2">

                <Label>Discount</Label>

                <Input
                  type="number"
                  min="0"
                  value={feeForm.discount}
                  onChange={(e) =>
                    setFeeForm({
                      ...feeForm,
                      discount: e.target.value,
                    })
                  }
                  placeholder="e.g. 1000"
                />

              </div>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="space-y-2">

                <Label>Payment Type</Label>

                <Select
                  value={feeForm.payment_type}
                  onValueChange={(value) =>
                    setFeeForm({
                      ...feeForm,
                      payment_type:
                        value as
                          | 'full'
                          | 'installment'
                          | 'monthly',
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="full">
                      Full Payment
                    </SelectItem>

                    <SelectItem value="installment">
                      Installment
                    </SelectItem>

                    <SelectItem value="monthly">
                      Monthly
                    </SelectItem>
                  </SelectContent>

                </Select>

              </div>

              <div className="space-y-2">

                <Label>Due Date</Label>

                <Input
                  type="date"
                  value={feeForm.due_date}
                  onChange={(e) =>
                    setFeeForm({
                      ...feeForm,
                      due_date: e.target.value,
                    })
                  }
                />

              </div>

            </div>

            <div className="space-y-2">

              <Label>Notes</Label>

              <Input
                value={feeForm.notes}
                onChange={(e) =>
                  setFeeForm({
                    ...feeForm,
                    notes: e.target.value,
                  })
                }
                placeholder="Optional notes"
              />

            </div>

            {feeForm.total_fee && (
              <div className="rounded-lg bg-blue-50 p-4">

                <div className="flex justify-between text-sm">
                  <span>Total Fee</span>
                  <span>
                    {formatCurrency(
                      Number(feeForm.total_fee)
                    )}
                  </span>
                </div>

                <div className="mt-1 flex justify-between text-sm">
                  <span>Discount</span>
                  <span>
                    -
                    {formatCurrency(
                      Number(feeForm.discount || 0)
                    )}
                  </span>
                </div>

                <div className="mt-2 flex justify-between border-t pt-2 font-bold text-blue-900">
                  <span>Final Fee</span>

                  <span>
                    {formatCurrency(
                      Math.max(
                        0,
                        Number(feeForm.total_fee || 0) -
                          Number(feeForm.discount || 0)
                      )
                    )}
                  </span>
                </div>

              </div>
            )}

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setShowFeeDialog(false)
              }
            >
              Cancel
            </Button>

            <Button
              onClick={handleAddFee}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Fee
                </>
              )}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

      {/* =====================================================
          ADD PAYMENT DIALOG
      ===================================================== */}

      <Dialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
      >

        <DialogContent className="max-w-lg">

          <DialogHeader>

            <DialogTitle className="text-green-700">
              Add Payment
            </DialogTitle>

            <DialogDescription>
              Record a payment against this student's fee.
            </DialogDescription>

          </DialogHeader>

          {selectedFee && (
            <div className="rounded-lg bg-blue-50 p-4">

              <p className="font-semibold text-blue-900">
                {selectedFee.student?.full_name}
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">

                <div>
                  <span className="text-gray-500">
                    Final Fee
                  </span>

                  <p className="font-semibold">
                    {formatCurrency(
                      Number(selectedFee.final_fee)
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-gray-500">
                    Remaining
                  </span>

                  <p className="font-semibold text-red-600">
                    {formatCurrency(
                      Number(selectedFee.due_amount)
                    )}
                  </p>
                </div>

              </div>

            </div>
          )}

          <div className="space-y-4 py-2">

            <div className="space-y-2">

              <Label>Payment Amount *</Label>

              <Input
                type="number"
                min="1"
                max={
                  selectedFee
                    ? Number(selectedFee.due_amount)
                    : undefined
                }
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    amount: e.target.value,
                  })
                }
                placeholder="Enter amount"
              />

            </div>

            <div className="space-y-2">

              <Label>Payment Method</Label>

              <Select
                value={paymentForm.payment_method}
                onValueChange={(value) =>
                  setPaymentForm({
                    ...paymentForm,
                    payment_method:
                      value as FeePayment['payment_method'],
                  })
                }
              >

                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="cash">
                    Cash
                  </SelectItem>

                  <SelectItem value="upi">
                    UPI
                  </SelectItem>

                  <SelectItem value="card">
                    Card
                  </SelectItem>

                  <SelectItem value="bank_transfer">
                    Bank Transfer
                  </SelectItem>

                  <SelectItem value="online">
                    Online
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>

            <div className="space-y-2">

              <Label>Payment Date</Label>

              <Input
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    payment_date: e.target.value,
                  })
                }
              />

            </div>

            <div className="space-y-2">

              <Label>Transaction ID</Label>

              <Input
                value={paymentForm.transaction_id}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    transaction_id:
                      e.target.value,
                  })
                }
                placeholder="For UPI / online payments"
              />

            </div>

            <div className="space-y-2">

              <Label>Notes</Label>

              <Input
                value={paymentForm.notes}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    notes: e.target.value,
                  })
                }
                placeholder="Optional notes"
              />

            </div>

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setShowPaymentDialog(false)
              }
            >
              Cancel
            </Button>

            <Button
              onClick={handleAddPayment}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Record Payment
                </>
              )}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

      {/* =====================================================
          PAYMENT HISTORY
      ===================================================== */}

      <Dialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
      >

        <DialogContent className="max-w-2xl">

          <DialogHeader>

            <DialogTitle className="text-blue-900">
              Payment History
            </DialogTitle>

            <DialogDescription>
              {selectedFee?.student?.full_name ||
                'Student'} payment history.
            </DialogDescription>

          </DialogHeader>

          <div className="space-y-4">

            {selectedFee && (
              <div className="grid grid-cols-3 gap-3">

                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-gray-500">
                    Final Fee
                  </p>

                  <p className="font-bold text-blue-900">
                    {formatCurrency(
                      Number(selectedFee.final_fee)
                    )}
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-xs text-gray-500">
                    Paid
                  </p>

                  <p className="font-bold text-green-700">
                    {formatCurrency(
                      Number(selectedFee.paid_amount)
                    )}
                  </p>
                </div>

                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-xs text-gray-500">
                    Due
                  </p>

                  <p className="font-bold text-red-700">
                    {formatCurrency(
                      Number(selectedFee.due_amount)
                    )}
                  </p>
                </div>

              </div>
            )}

            <div className="overflow-hidden rounded-lg border">

              {selectedPayments.length > 0 ? (
                <table className="w-full text-sm">

                  <thead className="bg-gray-50">

                    <tr>
                      <th className="px-4 py-3 text-left">
                        Date
                      </th>

                      <th className="px-4 py-3 text-left">
                        Method
                      </th>

                      <th className="px-4 py-3 text-left">
                        Transaction
                      </th>

                      <th className="px-4 py-3 text-right">
                        Amount
                      </th>

                      <th className="px-4 py-3 text-right">
                        Action
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {selectedPayments.map(
                      (payment) => (
                        <tr
                          key={payment.id}
                          className="border-t"
                        >

                          <td className="px-4 py-3">
                            {new Date(
                              payment.payment_date
                            ).toLocaleDateString(
                              'en-IN'
                            )}
                          </td>

                          <td className="px-4 py-3 capitalize">
                            {payment.payment_method.replace(
                              '_',
                              ' '
                            )}
                          </td>

                          <td className="px-4 py-3 text-gray-500">
                            {payment.transaction_id ||
                              '-'}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold text-green-700">
                            {formatCurrency(
                              Number(payment.amount)
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                selectedFee &&
                                openReceipt(
                                  selectedFee,
                                  payment
                                )
                              }
                              className="border-blue-200 text-blue-700"
                            >
                              <Receipt className="mr-1 h-3.5 w-3.5" />
                              Receipt
                            </Button>
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>
              ) : (
                <div className="py-10 text-center">

                  <Receipt className="mx-auto h-8 w-8 text-gray-300" />

                  <p className="mt-2 text-gray-500">
                    No payments recorded yet.
                  </p>

                </div>
              )}

            </div>

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setShowHistoryDialog(false)
              }
            >
              Close
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* =====================================================
          PAYMENT RECEIPT
      ===================================================== */}

      <Dialog
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">

          <DialogHeader>
            <DialogTitle className="text-blue-900">
              Payment Receipt
            </DialogTitle>

            <DialogDescription>
              Preview the payment receipt before printing.
            </DialogDescription>
          </DialogHeader>

          {selectedFee && selectedPayment && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-sm">
                      <img
                        src={logo.src}
                        alt="Starlight Academy Logo"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div>
                      <h3 className="text-2xl font-extrabold">
                        Starlight Academy
                      </h3>
                      <p className="mt-1 text-sm text-blue-100">
                        Excellence in Education
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-blue-100">
                      Fee Payment Receipt
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      {selectedPayment.receipt_number ||
                        `REC-${new Date(
                          selectedPayment.payment_date
                        ).getFullYear()}-${selectedPayment.id
                          .slice(0, 8)
                          .toUpperCase()}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">

                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-700">
                    Student Information
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">Student Name</p>
                      <p className="font-semibold text-gray-900">
                        {selectedFee.student?.full_name || 'Student'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Enrollment Number
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedFee.student?.enrollment_number || '-'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Course</p>
                      <p className="font-semibold text-gray-900">
                        {selectedFee.course?.title ||
                          selectedFee.student?.course ||
                          '-'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Payment Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(
                          selectedPayment.payment_date
                        ).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-700">
                    Fee Details
                  </p>

                  <div className="overflow-hidden rounded-xl border">
                    <div className="flex justify-between border-b px-4 py-3 text-sm">
                      <span className="text-gray-500">Total Course Fee</span>
                      <span className="font-semibold">
                        {formatCurrency(Number(selectedFee.total_fee))}
                      </span>
                    </div>

                    <div className="flex justify-between border-b px-4 py-3 text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-semibold">
                        - {formatCurrency(Number(selectedFee.discount))}
                      </span>
                    </div>

                    <div className="flex justify-between border-b bg-blue-50 px-4 py-3 text-sm">
                      <span className="font-semibold text-blue-900">
                        Final Fee
                      </span>
                      <span className="font-bold text-blue-900">
                        {formatCurrency(Number(selectedFee.final_fee))}
                      </span>
                    </div>

                    <div className="flex justify-between border-b px-4 py-3 text-sm">
                      <span className="text-gray-500">Previous Paid</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          Math.max(
                            0,
                            Number(selectedFee.paid_amount) -
                              Number(selectedPayment.amount)
                          )
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between border-b bg-green-50 px-4 py-4">
                      <span className="font-bold text-green-800">
                        This Payment
                      </span>
                      <span className="text-xl font-extrabold text-green-700">
                        {formatCurrency(Number(selectedPayment.amount))}
                      </span>
                    </div>

                    <div className="flex justify-between px-4 py-3 text-sm">
                      <span className="font-semibold text-red-600">
                        Remaining Due
                      </span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(Number(selectedFee.due_amount))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="mt-1 font-semibold capitalize">
                      {selectedPayment.payment_method.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Transaction ID</p>
                    <p className="mt-1 break-all font-semibold">
                      {selectedPayment.transaction_id || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                      Payment Status
                    </p>
                    <p className="mt-1 text-sm text-green-800">
                      {selectedFee.fee_status === 'paid'
                        ? 'Fee Paid in Full'
                        : 'Partial Payment Received'}
                    </p>
                  </div>

                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>

                <div className="border-t border-dashed pt-5 text-center text-xs text-gray-500">
                  Thank you for choosing Starlight Academy.
                  <br />
                  This is a computer-generated fee payment receipt.
                </div>

              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowReceiptDialog(false)}
            >
              Close
            </Button>

            <Button
              onClick={printReceipt}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Receipt className="mr-2 h-4 w-4" />
              Print / Save PDF
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
}