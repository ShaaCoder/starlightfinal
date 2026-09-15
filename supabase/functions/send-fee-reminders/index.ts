import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LibraryStudent {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  membership_type: string;
  membership_start: string | null;
  membership_end: string | null;
  status: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildEmailHtml(
  student: LibraryStudent,
  notificationType: "expired" | "expiring_soon"
): string {
  const endDate = student.membership_end
    ? formatDate(student.membership_end)
    : "N/A";
  const membershipLabel = student.membership_type.replace(/_/g, " ");

  const subject =
    notificationType === "expired"
      ? "Library Membership Expired - Renew Now"
      : "Library Membership Expiring Soon";

  const heading =
    notificationType === "expired"
      ? "Your library membership has expired"
      : "Your library membership is expiring soon";

  const message =
    notificationType === "expired"
      ? `Your <strong>${membershipLabel}</strong> membership at Vihaan Education Academy Library expired on <strong>${endDate}</strong>. Please renew your membership at the earliest to continue using the library facilities.`
      : `Your <strong>${membershipLabel}</strong> membership at Vihaan Education Academy Library will expire on <strong>${endDate}</strong>. Please renew your membership to avoid interruption in library access.`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <tr><td style="background:#2563eb;padding:28px 32px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800">Vihaan Education Academy</h1>
          <p style="margin:4px 0 0;color:#c7d2fe;font-size:13px">Library Management System</p>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px">${heading}</h2>
          <p style="margin:0 0 12px;color:#475569;font-size:15px;line-height:1.6">Dear <strong>${student.name}</strong>,</p>
          <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6">${message}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px">
            <tr><td style="padding:16px">
              <table width="100%" cellpadding="4" cellspacing="0">
                <tr><td style="color:#64748b;font-size:13px;width:140px">Student Name</td><td style="color:#1e293b;font-size:14px;font-weight:600">${student.name}</td></tr>
                <tr><td style="color:#64748b;font-size:13px">Membership</td><td style="color:#1e293b;font-size:14px;font-weight:600;text-transform:capitalize">${membershipLabel}</td></tr>
                <tr><td style="color:#64748b;font-size:13px">Expiry Date</td><td style="color:#1e293b;font-size:14px;font-weight:600">${endDate}</td></tr>
                <tr><td style="color:#64748b;font-size:13px">Phone</td><td style="color:#1e293b;font-size:14px;font-weight:600">${student.phone || "-"}</td></tr>
              </table>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.6">Please visit the library office to renew your membership. If you have already renewed, please ignore this email.</p>
          <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0;padding-top:16px">This is an automated message from Vihaan Education Academy Library System. For queries, contact 9212644428, 9350211122.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Vihaan Education Academy <noreply@vihaaneducationacademy.com>",
      to: [to],
      reply_to: "vihaaneducationacademy@gmail.com",
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: `Resend API error: ${res.status} ${body}` };
  }

  return { ok: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const today = new Date().toISOString().split("T")[0];
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Fetch students whose membership has already expired
    const { data: expiredStudents, error: expiredErr } = await supabase
      .from("library_students")
      .select("*")
      .lt("membership_end", today)
      .not("status", "eq", "suspended");

    if (expiredErr) throw expiredErr;

    // Fetch students whose membership expires within 3 days
    const { data: expiringStudents, error: expiringErr } = await supabase
      .from("library_students")
      .select("*")
      .gte("membership_end", today)
      .lte("membership_end", threeDaysLater)
      .neq("status", "suspended");

    if (expiringErr) throw expiringErr;

    const results: {
      student: string;
      email: string;
      type: string;
      status: string;
      error?: string;
    }[] = [];

    const processStudent = async (
      student: LibraryStudent,
      type: "expired" | "expiring_soon"
    ) => {
      if (!student.email) {
        results.push({
          student: student.name,
          email: "-",
          type,
          status: "skipped",
          error: "No email on file",
        });
        return;
      }

      // Check if we already sent a notification for this membership period
      const { data: existing } = await supabase
        .from("library_fee_notifications")
        .select("id")
        .eq("student_id", student.id)
        .eq("notification_type", type)
        .eq("membership_end", student.membership_end)
        .maybeSingle();

      if (existing) {
        results.push({
          student: student.name,
          email: student.email,
          type,
          status: "skipped",
          error: "Already notified",
        });
        return;
      }

      const subject =
        type === "expired"
          ? "Library Membership Expired - Renew Now"
          : "Library Membership Expiring Soon";

      const html = buildEmailHtml(student, type);
      const emailResult = await sendEmail(student.email, subject, html);

      // Only successful deliveries are logged so failed attempts can be retried.
      if (emailResult.ok) {
        const { error: logError } = await supabase.from("library_fee_notifications").insert({
          student_id: student.id,
          student_email: student.email,
          notification_type: type,
          membership_end: student.membership_end,
          status: "sent",
        });
        if (logError) throw logError;
      }

      // Update student status to expired if membership has lapsed
      if (type === "expired" && emailResult.ok && student.status !== "expired") {
        await supabase
          .from("library_students")
          .update({ status: "expired" })
          .eq("id", student.id);
      }

      results.push({
        student: student.name,
        email: student.email,
        type,
        status: emailResult.ok ? "sent" : "failed",
        error: emailResult.error,
      });
    };

    for (const student of expiredStudents || []) {
      await processStudent(student as LibraryStudent, "expired");
    }
    for (const student of expiringStudents || []) {
      await processStudent(student as LibraryStudent, "expiring_soon");
    }

    const sentCount = results.filter((r) => r.status === "sent").length;
    const skippedCount = results.filter((r) => r.status === "skipped").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: results.length,
          sent: sentCount,
          skipped: skippedCount,
          failed: failedCount,
        },
        details: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
