import { createClient } from "@/lib/supabase/client";
import {
  Admission,
  StudentProfile,
  Course,
  StudentCategory,
} from "@/lib/types";

export interface AdmissionFilters {
  status?: "pending" | "approved" | "rejected";
  category?: StudentCategory;
  exam?: string;
  level?: string;
  stream?: string;
  session?: string;
  batch?: string;
  search?: string;
}

export interface StudentProfileFilters {
  is_approved?: boolean;
  is_active?: boolean;
  category?: StudentCategory;
  exam?: string;
  level?: string;
  stream?: string;
  session?: string;
  batch?: string;
  search?: string;
}

export async function fetchAdmissions(
  filters?: AdmissionFilters
): Promise<Admission[]> {
  const supabase = createClient();

  try {
    let query = supabase
      .from("admissions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.exam) {
      query = query.eq("exam", filters.exam);
    }

    if (filters?.level) {
      query = query.eq("level", filters.level);
    }

    if (filters?.stream) {
      query = query.eq("stream", filters.stream);
    }

    if (filters?.session) {
      query = query.eq("session", filters.session);
    }

    if (filters?.batch) {
      query = query.eq("batch", filters.batch);
    }

    if (filters?.search) {
      const search = `%${filters.search}%`;

      query = query.or(
        `student_name.ilike.${search},email.ilike.${search},phone.ilike.${search},course.ilike.${search}`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch admissions: ${error.message}`);
    }

    return (data as Admission[]) || [];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    throw new Error(`fetchAdmissions error: ${message}`);
  }
}

export async function fetchAdmissionCounts(): Promise<{
  pending: number;
  approved: number;
  rejected: number;
}> {
  const supabase = createClient();

  try {
    const {
      count: pendingCount,
      error: pendingError,
    } = await supabase
      .from("admissions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending");

    if (pendingError) {
      throw new Error(
        `Failed to count pending admissions: ${pendingError.message}`
      );
    }

    const {
      count: approvedCount,
      error: approvedError,
    } = await supabase
      .from("admissions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "approved");

    if (approvedError) {
      throw new Error(
        `Failed to count approved admissions: ${approvedError.message}`
      );
    }

    const {
      count: rejectedCount,
      error: rejectedError,
    } = await supabase
      .from("admissions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "rejected");

    if (rejectedError) {
      throw new Error(
        `Failed to count rejected admissions: ${rejectedError.message}`
      );
    }

    return {
      pending: pendingCount ?? 0,
      approved: approvedCount ?? 0,
      rejected: rejectedCount ?? 0,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    throw new Error(`fetchAdmissionCounts error: ${message}`);
  }
}

export async function fetchStudentProfiles(
  filters?: StudentProfileFilters
): Promise<StudentProfile[]> {
  const supabase = createClient();

  try {
    let query = supabase
      .from("student_profiles")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (filters?.is_approved !== undefined) {
      query = query.eq("is_approved", filters.is_approved);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.exam) {
      query = query.eq("exam", filters.exam);
    }

    if (filters?.level) {
      query = query.eq("level", filters.level);
    }

    if (filters?.stream) {
      query = query.eq("stream", filters.stream);
    }

    if (filters?.session) {
      query = query.eq("session", filters.session);
    }

    if (filters?.batch) {
      query = query.eq("batch", filters.batch);
    }

    if (filters?.search) {
      const search = `%${filters.search}%`;

      query = query.or(
        `full_name.ilike.${search},email.ilike.${search},phone.ilike.${search},enrollment_number.ilike.${search},course.ilike.${search}`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Failed to fetch student profiles: ${error.message}`
      );
    }

    return (data as StudentProfile[]) || [];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    throw new Error(`fetchStudentProfiles error: ${message}`);
  }
}

/**
 * Create Admission
 */
export async function createAdmission(
  data: Partial<Admission>
): Promise<Admission> {
  const supabase = createClient();

  try {
    const insertData: Partial<Admission> = {
      ...data,
      status: data.status ?? "pending",
    };

    /*
     * Your current Supabase generated Database type
     * does not contain the insert type for admissions.
     * Use a local escape hatch until the generated types
     * are regenerated correctly.
     */
    const db = supabase as any;

    const { data: result, error } = await db
      .from("admissions")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to create admission: ${error.message}`
      );
    }

    if (!result) {
      throw new Error(
        "No data returned after creating admission"
      );
    }

    return result as Admission;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    throw new Error(`createAdmission error: ${message}`);
  }
}

/**
 * Approve Admission
 */
export async function approveAdmission(
  id: string
): Promise<string> {
  const supabase = createClient();

  try {
    const db = supabase as any;

    const { data, error } = await db.rpc(
      "approve_admission",
      {
        p_admission_id: id,
      }
    );

    if (error) {
      throw new Error(
        `Failed to approve admission: ${error.message}`
      );
    }

    return (data as string) || "";
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    throw new Error(`approveAdmission error: ${message}`);
  }
}

/**
 * Reject Admission
 */
export async function rejectAdmission(
  id: string
): Promise<void> {
  const supabase = createClient();

  try {
    const db = supabase as any;

    const { error } = await db.rpc(
      "reject_admission",
      {
        p_admission_id: id,
      }
    );

    if (error) {
      throw new Error(
        `Failed to reject admission: ${error.message}`
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    throw new Error(`rejectAdmission error: ${message}`);
  }
}

/**
 * Create Student Profile
 */
export async function createStudentProfile(
  data: Partial<StudentProfile> & {
    generateEnrollment?: boolean;
  }
): Promise<StudentProfile> {
  const supabase = createClient();

  try {
    const {
      generateEnrollment,
      ...profileData
    } = data;

    let enrollmentNumber: string | null =
      profileData.enrollment_number ?? null;

    /*
     * Generate enrollment number through Supabase RPC
     */
    if (generateEnrollment && !enrollmentNumber) {
      const db = supabase as any;

      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await db.rpc("next_enrollment_number");

      if (enrollmentError) {
        throw new Error(
          `Failed to generate enrollment number: ${enrollmentError.message}`
        );
      }

      enrollmentNumber = enrollmentData as string;
    }

    const insertData: Partial<StudentProfile> = {
      ...profileData,
      enrollment_number: enrollmentNumber,
      is_approved: profileData.is_approved ?? false,
      is_active: profileData.is_active ?? true,
    };

    /*
     * Your generated Supabase type currently resolves
     * student_profiles insert to never[].
     */
    const db = supabase as any;

    const {
      data: result,
      error,
    } = await db
      .from("student_profiles")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to create student profile: ${error.message}`
      );
    }

    if (!result) {
      throw new Error(
        "No data returned after creating student profile"
      );
    }

    return result as StudentProfile;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    throw new Error(
      `createStudentProfile error: ${message}`
    );
  }
}

/**
 * Update Student Profile
 */
export async function updateStudentProfile(
  id: string,
  data: Partial<StudentProfile>
): Promise<void> {
  const supabase = createClient();

  try {
    const db = supabase as any;

    const { error } = await db
      .from("student_profiles")
      .update(data)
      .eq("id", id);

    if (error) {
      throw new Error(
        `Failed to update student profile: ${error.message}`
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    throw new Error(
      `updateStudentProfile error: ${message}`
    );
  }
}

/**
 * Toggle Student Active Status
 */
export async function toggleStudentActive(
  id: string,
  isActive: boolean
): Promise<void> {
  const supabase = createClient();

  try {
    const db = supabase as any;

    const { error } = await db
      .from("student_profiles")
      .update({
        is_active: isActive,
      })
      .eq("id", id);

    if (error) {
      throw new Error(
        `Failed to toggle student active status: ${error.message}`
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    throw new Error(
      `toggleStudentActive error: ${message}`
    );
  }
}

/**
 * Fetch Courses
 */
export async function fetchCoursesFromDB(): Promise<Course[]> {
  const supabase = createClient();

  try {
    const {
      data,
      error,
    } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Failed to fetch courses: ${error.message}`
      );
    }

    return (data as Course[]) || [];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    throw new Error(
      `fetchCoursesFromDB error: ${message}`
    );
  }
}