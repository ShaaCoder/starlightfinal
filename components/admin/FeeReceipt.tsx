"use client";

import { useEffect } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryPayment, LibraryStudent } from "@/lib/types";

type Props = {
  payment: LibraryPayment;
  student?: LibraryStudent;
  onClose: () => void;
};

/* =========================================================
   NUMBER TO WORDS - INDIAN NUMBER SYSTEM
========================================================= */

function numberToWordsIndian(num: number): string {
  if (!num || num === 0) {
    return "Zero Rupees Only";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];

  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const twoDigits = (n: number): string => {
    if (n < 10) {
      return ones[n];
    }

    if (n < 20) {
      return teens[n - 10];
    }

    return (
      tens[Math.floor(n / 10)] +
      (n % 10 ? " " + ones[n % 10] : "")
    );
  };

  const threeDigits = (n: number): string => {
    if (n < 100) {
      return twoDigits(n);
    }

    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " " + twoDigits(n % 100) : "")
    );
  };

  let remaining = Math.floor(num);
  let words = "";

  if (remaining >= 10000000) {
    words +=
      threeDigits(Math.floor(remaining / 10000000)) +
      " Crore ";

    remaining %= 10000000;
  }

  if (remaining >= 100000) {
    words +=
      threeDigits(Math.floor(remaining / 100000)) +
      " Lakh ";

    remaining %= 100000;
  }

  if (remaining >= 1000) {
    words +=
      threeDigits(Math.floor(remaining / 1000)) +
      " Thousand ";

    remaining %= 1000;
  }

  if (remaining > 0) {
    words += threeDigits(remaining);
  }

  return `${words.trim()} Rupees Only`;
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date: string) {
  if (!date) {
    return "-";
  }

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* =========================================================
   RECEIPT NUMBER
========================================================= */

function getReceiptNumber(payment: LibraryPayment) {
  const year = new Date(payment.payment_date).getFullYear();

  const id = String(payment.id)
    .replace(/-/g, "")
    .slice(-6)
    .toUpperCase();

  return `VEA-${year}-${id}`;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function FeeReceipt({
  payment,
  student,
  onClose,
}: Props) {
  /* =======================================================
     BODY CLASS
  ======================================================= */

  useEffect(() => {
    document.body.classList.add("printing-receipt");

    return () => {
      document.body.classList.remove("printing-receipt");
    };
  }, []);

  /* =======================================================
     PRINT
  ======================================================= */

  const printReceipt = () => {
    window.print();
  };

  /* =======================================================
     DATA
  ======================================================= */

  const amount = Number(payment.amount || 0);

  const formattedAmount = amount.toLocaleString("en-IN");

  const paymentType = String(payment.payment_type || "")
    .replace(/_/g, " ");

  const membershipType =
    student?.membership_type
      ?.replace(/_/g, " ")
      ?.replace(/\b\w/g, (char) => char.toUpperCase()) || "-";

  const receiptNumber = getReceiptNumber(payment);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      {/* =====================================================
          SCREEN CONTROLS
      ====================================================== */}

      <div className="receipt-controls">
        <Button
          variant="outline"
          onClick={onClose}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Close
        </Button>

        <Button
          onClick={printReceipt}
          className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>

      {/* =====================================================
          RECEIPT PAGE
      ====================================================== */}

      <div className="fee-receipt-page">
        <div className="fee-receipt">

          {/* =================================================
              TOP RED BAR
          ================================================== */}

          <div className="top-red-bar" />

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="receipt-header">

            {/* LOGO */}

            <div className="academy-logo">
              <img
                src="/vihaanlogo.png"
                alt="Vihaan Education Academy Logo"
              />
            </div>

            {/* ACADEMY INFORMATION */}

            <div className="academy-info">

              <h1>
                VIHAAN EDUCATION ACADEMY
              </h1>

              <div className="tagline">
                PERSONAL GROWTH
                <span> • </span>
                PROFESSIONAL GUIDE
              </div>

              <p>
                Vijay Vihar Phase-1, Near D.V. Public School,
                Delhi-110085
              </p>

              <p>
                Ph: 9122644428 / 9350211222
              </p>

            </div>

          </div>

          {/* =================================================
              BLUE DIVIDER
          ================================================== */}

          <div className="header-divider">
            <span />
            <span />
          </div>

          {/* =================================================
              RECEIPT TITLE
          ================================================== */}

          <div className="receipt-title-wrapper">

            <div className="receipt-title">
              FEE RECEIPT
            </div>

            <div className="receipt-title-line" />

          </div>

          {/* =================================================
              RECEIPT INFORMATION
          ================================================== */}

          <div className="receipt-meta">

            <div className="meta-box">

              <span className="meta-label">
                RECEIPT NO.
              </span>

              <strong>
                {receiptNumber}
              </strong>

            </div>

            <div className="meta-box">

              <span className="meta-label">
                DATE
              </span>

              <strong>
                {formatDate(payment.payment_date)}
              </strong>

            </div>

          </div>

          {/* =================================================
              STUDENT INFORMATION
          ================================================== */}

          <div className="section-heading">
            STUDENT INFORMATION
          </div>

          <div className="student-details">

            <div className="detail-row">

              <div className="detail-label">
                Student Name
              </div>

              <div className="detail-value">
                {student?.name || "Student"}
              </div>

            </div>

            <div className="detail-row">

              <div className="detail-label">
                Phone Number
              </div>

              <div className="detail-value">
                {student?.phone || "-"}
              </div>

            </div>

            <div className="detail-row">

              <div className="detail-label">
                Membership Type
              </div>

              <div className="detail-value">
                {membershipType}
              </div>

            </div>

          </div>

          {/* =================================================
              PAYMENT DETAILS
          ================================================== */}

          <div className="section-heading">
            PAYMENT DETAILS
          </div>

          <div className="payment-table">

            <div className="payment-header">

              <span>
                DESCRIPTION
              </span>

              <span>
                AMOUNT
              </span>

            </div>

            <div className="payment-row">

              <span>
                {paymentType
                  .replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                  )}
              </span>

              <strong>
                ₹{formattedAmount}
              </strong>

            </div>

          </div>

          {/* =================================================
              TOTAL
          ================================================== */}

          <div className="total-section">

            <div className="total-content">

              <span className="total-label">
                TOTAL AMOUNT PAID
              </span>

              <strong className="total-amount">
                ₹{formattedAmount}
              </strong>

            </div>

            <div className="paid-badge">
              <span>✓</span>
              PAID
            </div>

          </div>

          {/* =================================================
              AMOUNT IN WORDS
          ================================================== */}

          <div className="amount-words">

            <span>
              Amount in Words:
            </span>

            <strong>
              {numberToWordsIndian(amount)}
            </strong>

          </div>

          {/* =================================================
              MEMBERSHIP DATES
          ================================================== */}

          <div className="membership-dates">

            <div className="date-card">

              <span>
                MEMBERSHIP START
              </span>

              <strong>
                {student?.membership_start
                  ? formatDate(student.membership_start)
                  : "-"}
              </strong>

            </div>

            <div className="date-card">

              <span>
                MEMBERSHIP END
              </span>

              <strong>
                {student?.membership_end
                  ? formatDate(student.membership_end)
                  : "-"}
              </strong>

            </div>

          </div>

          {/* =================================================
              PAYMENT STATUS
          ================================================== */}

          <div className="payment-status">

            <div>

              <span>
                PAYMENT TYPE
              </span>

              <strong>
                {paymentType
                  .replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                  )}
              </strong>

            </div>

            <div>

              <span>
                STATUS
              </span>

              <strong className="status-completed">
                {String(payment.status || "completed")
                  .toUpperCase()}
              </strong>

            </div>

          </div>

          {/* =================================================
              SIGNATURE
          ================================================== */}

          <div className="signature-area">

            <div className="signature-box">

              <div className="signature-line" />

              <strong>
                Authorized Signatory
              </strong>

              <span>
                VIHAAN EDUCATION ACADEMY
              </span>

            </div>

          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="receipt-footer">

            <strong>
              Fees once paid are not refundable.
            </strong>

            <span>
              This is a computer generated fee receipt.
              No signature is required.
            </span>

          </div>

          {/* =================================================
              BOTTOM BLUE BAR
          ================================================== */}

          <div className="bottom-bar">

            <span />
            <span />

          </div>

        </div>
      </div>

      {/* =====================================================
          STYLES
      ====================================================== */}

      <style jsx global>{`

        /* =====================================================
           SCREEN CONTROLS
        ====================================================== */

        .receipt-controls {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;

          display: flex;
          gap: 10px;

          padding: 10px;

          background: white;

          border-radius: 12px;

          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.15);
        }


        /* =====================================================
           PAGE BACKGROUND
        ====================================================== */

        .fee-receipt-page {
          min-height: 100vh;

          display: flex;
          justify-content: center;

          padding: 70px 20px 40px;

          background:
            linear-gradient(
              135deg,
              #eff6ff 0%,
              #f8fafc 50%,
              #fef2f2 100%
            );
        }


        /* =====================================================
           RECEIPT
        ====================================================== */

        .fee-receipt {
          position: relative;

          width: 148mm;
          height: 210mm;

          min-height: 0;

          margin: 0 auto;

          padding: 7mm 9mm 6mm;

          background: #ffffff;

          color: #111827;

          box-sizing: border-box;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          border: 1px solid #d1d5db;

          box-shadow:
            0 15px 45px rgba(15, 23, 42, 0.16);

          overflow: hidden;
        }


        /* =====================================================
           TOP RED BAR
        ====================================================== */

        .top-red-bar {
          position: absolute;

          top: 0;
          left: 0;
          right: 0;

          height: 4px;

          background:
            linear-gradient(
              90deg,
              #b91c1c,
              #dc2626,
              #2563eb,
              #1d4ed8
            );
        }


        /* =====================================================
           HEADER
        ====================================================== */

        .receipt-header {
          display: flex;

          align-items: center;

          gap: 12px;

          padding-top: 3px;

          padding-bottom: 7px;
        }


        /* =====================================================
           LOGO
        ====================================================== */

        .academy-logo {
          width: 58px;
          height: 58px;

          min-width: 58px;

          display: flex;

          align-items: center;
          justify-content: center;
        }

        .academy-logo img {
          width: 58px;
          height: 58px;

          object-fit: contain;

          display: block;
        }


        /* =====================================================
           ACADEMY INFO
        ====================================================== */

        .academy-info {
          flex: 1;

          text-align: center;
        }

        .academy-info h1 {
          margin: 0;

          color: #0f172a;

          font-size: 19px;

          line-height: 1.15;

          font-weight: 900;

          letter-spacing: 0.3px;
        }

        .academy-info .tagline {
          display: inline-block;

          margin-top: 3px;

          padding: 2px 9px;

          background: #eff6ff;

          color: #1d4ed8;

          border-radius: 20px;

          font-size: 7px;

          font-weight: 800;

          letter-spacing: 0.25px;
        }

        .academy-info p {
          margin: 3px 0 0;

          color: #475569;

          font-size: 7px;

          line-height: 1.2;
        }


        /* =====================================================
           HEADER DIVIDER
        ====================================================== */

        .header-divider {
          display: flex;

          height: 3px;

          margin-bottom: 7px;
        }

        .header-divider span:first-child {
          flex: 1;

          background: #dc2626;
        }

        .header-divider span:last-child {
          width: 34%;

          background: #2563eb;
        }


        /* =====================================================
           RECEIPT TITLE
        ====================================================== */

        .receipt-title-wrapper {
          text-align: center;

          margin-bottom: 8px;
        }

        .receipt-title {
          display: inline-block;

          padding: 5px 24px;

          background:
            linear-gradient(
              90deg,
              #b91c1c,
              #dc2626
            );

          color: white;

          border-radius: 4px;

          font-size: 12px;

          font-weight: 900;

          letter-spacing: 1px;

          box-shadow:
            0 3px 8px rgba(185, 28, 28, 0.2);
        }

        .receipt-title-line {
          width: 70%;

          height: 1px;

          margin: 5px auto 0;

          background: #dbeafe;
        }


        /* =====================================================
           META
        ====================================================== */

        .receipt-meta {
          display: grid;

          grid-template-columns: 1fr 1fr;

          border: 1px solid #bfdbfe;

          border-radius: 5px;

          overflow: hidden;

          background: #f8fbff;
        }

        .meta-box {
          padding: 6px 8px;

          display: flex;

          flex-direction: column;

          gap: 2px;
        }

        .meta-box:first-child {
          border-right: 1px solid #bfdbfe;
        }

        .meta-label {
          color: #64748b;

          font-size: 6px;

          font-weight: 800;

          letter-spacing: 0.5px;
        }

        .meta-box strong {
          color: #0f172a;

          font-size: 8px;
        }


        /* =====================================================
           SECTION HEADING
        ====================================================== */

        .section-heading {
          margin-top: 8px;
          margin-bottom: 4px;

          color: #1d4ed8;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 0.7px;
        }


        /* =====================================================
           STUDENT DETAILS
        ====================================================== */

        .student-details {
          border: 1px solid #cbd5e1;

          border-radius: 4px;

          overflow: hidden;
        }

        .detail-row {
          display: grid;

          grid-template-columns: 35% 65%;

          min-height: 24px;

          border-bottom: 1px solid #e2e8f0;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          display: flex;

          align-items: center;

          padding: 5px 8px;

          background: #eff6ff;

          color: #475569;

          font-size: 7px;

          font-weight: 700;
        }

        .detail-value {
          display: flex;

          align-items: center;

          padding: 5px 8px;

          color: #0f172a;

          font-size: 8px;

          font-weight: 700;
        }


        /* =====================================================
           PAYMENT TABLE
        ====================================================== */

        .payment-table {
          border: 1px solid #cbd5e1;

          border-radius: 4px;

          overflow: hidden;
        }

        .payment-header,
        .payment-row {
          display: grid;

          grid-template-columns: 1fr 95px;
        }

        .payment-header {
          background:
            linear-gradient(
              90deg,
              #eff6ff,
              #fef2f2
            );

          color: #0f172a;

          font-size: 7px;

          font-weight: 900;
        }

        .payment-header span,
        .payment-row span,
        .payment-row strong {
          padding: 6px 8px;
        }

        .payment-header span:last-child,
        .payment-row strong {
          text-align: right;

          border-left: 1px solid #cbd5e1;
        }

        .payment-row {
          min-height: 27px;

          color: #334155;

          font-size: 8px;

          border-top: 1px solid #cbd5e1;
        }

        .payment-row strong {
          color: #0f172a;

          font-size: 9px;
        }


        /* =====================================================
           TOTAL
        ====================================================== */

        .total-section {
          margin-top: 8px;

          padding: 9px 11px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          border-radius: 5px;

          border: 2px solid #1d4ed8;

          background:
            linear-gradient(
              90deg,
              #eff6ff,
              #ffffff
            );
        }

        .total-content {
          display: flex;

          flex-direction: column;

          gap: 1px;
        }

        .total-label {
          color: #64748b;

          font-size: 6px;

          font-weight: 800;

          letter-spacing: 0.5px;
        }

        .total-amount {
          color: #0f172a;

          font-size: 18px;

          line-height: 1.1;

          font-weight: 900;
        }

        .paid-badge {
          display: flex;

          align-items: center;

          gap: 4px;

          padding: 5px 9px;

          border: 1.5px solid #16a34a;

          border-radius: 4px;

          background: #f0fdf4;

          color: #15803d;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 0.5px;
        }

        .paid-badge span {
          font-size: 8px;
        }


        /* =====================================================
           AMOUNT WORDS
        ====================================================== */

        .amount-words {
          margin-top: 6px;

          padding: 6px 8px;

          border-left: 3px solid #dc2626;

          background: #fef2f2;

          font-size: 7px;

          line-height: 1.35;
        }

        .amount-words span {
          color: #64748b;

          font-weight: 700;
        }

        .amount-words strong {
          margin-left: 4px;

          color: #334155;

          font-weight: 700;
        }


        /* =====================================================
           MEMBERSHIP DATES
        ====================================================== */

        .membership-dates {
          margin-top: 6px;

          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 6px;
        }

        .date-card {
          padding: 6px 8px;

          border: 1px solid #bfdbfe;

          border-radius: 4px;

          background: #f8fbff;

          display: flex;

          flex-direction: column;

          gap: 2px;
        }

        .date-card span {
          color: #64748b;

          font-size: 6px;

          font-weight: 800;

          letter-spacing: 0.4px;
        }

        .date-card strong {
          color: #0f172a;

          font-size: 8px;
        }


        /* =====================================================
           PAYMENT STATUS
        ====================================================== */

        .payment-status {
          margin-top: 6px;

          padding: 6px 8px;

          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 10px;

          border: 1px solid #cbd5e1;

          border-radius: 4px;
        }

        .payment-status > div {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 8px;
        }

        .payment-status span {
          color: #64748b;

          font-size: 6px;

          font-weight: 800;

          letter-spacing: 0.4px;
        }

        .payment-status strong {
          color: #0f172a;

          font-size: 7px;
        }

        .status-completed {
          color: #15803d !important;

          font-weight: 900 !important;
        }


        /* =====================================================
           SIGNATURE
        ====================================================== */

        .signature-area {
          margin-top: 10px;

          display: flex;

          justify-content: flex-end;
        }

        .signature-box {
          width: 48mm;

          text-align: center;

          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 2px;
        }

        .signature-line {
          width: 100%;

          border-top: 1px solid #0f172a;

          margin-bottom: 2px;
        }

        .signature-box strong {
          color: #0f172a;

          font-size: 7px;
        }

        .signature-box span {
          color: #64748b;

          font-size: 6px;
        }


        /* =====================================================
           FOOTER
        ====================================================== */

        .receipt-footer {
          margin-top: 7px;

          padding-top: 5px;

          border-top: 1px solid #cbd5e1;

          text-align: center;

          display: flex;

          flex-direction: column;

          gap: 2px;
        }

        .receipt-footer strong {
          color: #b91c1c;

          font-size: 6px;
        }

        .receipt-footer span {
          color: #64748b;

          font-size: 5.5px;
        }


        /* =====================================================
           BOTTOM BAR
        ====================================================== */

        .bottom-bar {
          position: absolute;

          bottom: 0;

          left: 0;
          right: 0;

          height: 4px;

          display: flex;
        }

        .bottom-bar span:first-child {
          flex: 1;

          background: #2563eb;
        }

        .bottom-bar span:last-child {
          width: 34%;

          background: #dc2626;
        }


        /* =====================================================
           PRINT
        ====================================================== */

        @media print {

          @page {
            size: A5 portrait;
            margin: 0;
          }

          html,
          body {
            width: 148mm !important;
            height: 210mm !important;

            margin: 0 !important;
            padding: 0 !important;

            background: white !important;
          }

          body {
            overflow: hidden !important;

            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          .fee-receipt-page,
          .fee-receipt-page * {
            visibility: visible;
          }

          .receipt-controls {
            display: none !important;
          }

          .fee-receipt-page {
            position: absolute !important;

            left: 0 !important;
            top: 0 !important;

            width: 148mm !important;
            height: 210mm !important;

            min-height: 0 !important;

            margin: 0 !important;
            padding: 0 !important;

            display: block !important;

            background: white !important;
          }

          .fee-receipt {
            width: 148mm !important;
            height: 210mm !important;

            min-height: 0 !important;

            margin: 0 !important;

            padding: 7mm 9mm 6mm !important;

            border: none !important;

            box-shadow: none !important;

            overflow: hidden !important;

            box-sizing: border-box !important;

            page-break-before: avoid !important;
            page-break-after: avoid !important;
            break-before: avoid-page !important;
            break-after: avoid-page !important;
          }

          .academy-logo img {
            display: block !important;

            visibility: visible !important;

            width: 58px !important;
            height: 58px !important;

            object-fit: contain !important;
          }

          .top-red-bar,
          .bottom-bar,
          .receipt-title,
          .academy-info .tagline,
          .total-section,
          .amount-words,
          .detail-label,
          .payment-header {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }


        /* =====================================================
           MOBILE SCREEN
        ====================================================== */

        @media screen and (max-width: 700px) {

          .receipt-controls {
            top: 10px;
            right: 10px;

            padding: 7px;

            gap: 6px;
          }

          .fee-receipt-page {
            padding: 70px 10px 20px;

            overflow-x: auto;
          }

          .fee-receipt {
            flex-shrink: 0;
          }
        }

      `}</style>
    </>
  );
}