'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  User,
  Session,
  AuthChangeEvent,
} from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client';
import type { StudentCategory } from '@/lib/types';

export type UserRole = 'admin' | 'student' | null;

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  course: string | null;
  class_grade: string | null;
  enrollment_number: string | null;
  subjects: string[];
  address: string | null;
  is_approved: boolean;
  is_active: boolean;
  category: StudentCategory | null;
  exam: string | null;
  level: string | null;
  stream: string | null;
  session: string | null;
  batch: string | null;
  batch_timing: string | null;
  duration: string | null;
  computer_course: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  date_of_birth: string | null;
  application_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRoleRow {
  user_id: string;
  role: 'admin' | 'student';
  created_at?: string;
}

interface SignUpStudentData {
  full_name: string;
  phone?: string;
  course?: string;
  class_grade?: string;
  enrollment_number?: string;
  subjects?: string[];
  address?: string;
  category?: StudentCategory;
  exam?: string;
  level?: string;
  stream?: string;
  session?: string;
  batch?: string;
  batch_timing?: string;
  duration?: string;
  computer_course?: string;
  parent_name?: string;
  parent_phone?: string;
  date_of_birth?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  profile: StudentProfile | null;
  isLoading: boolean;

  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<void>;

  signUpStudent: (
    email: string,
    password: string,
    data: SignUpStudentData
  ) => Promise<void>;

  signIn: (
    email: string,
    password: string
  ) => Promise<void>;

  signOut: () => Promise<void>;

  refreshRoleAndProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [profile, setProfile] =
    useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /*
   * Keep one Supabase browser client instance.
   */
  const supabase = useRef(createClient()).current;

  /**
   * Fetch the logged-in user's role and student profile.
   */
  const fetchRoleAndProfile = async (
    userId: string
  ) => {
    try {
      /*
       * ------------------------------------------------------
       * 1. Fetch user's role
       * ------------------------------------------------------
       */
      const {
        data: roleRaw,
        error: roleFetchError,
      } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleFetchError) {
        console.error(
          'Error fetching user role:',
          roleFetchError
        );

        setRole(null);
        setProfile(null);
        return;
      }

      const roleData =
        roleRaw as unknown as UserRoleRow | null;

      const detectedRole: UserRole =
        roleData?.role ?? null;

      setRole(detectedRole);

      /*
       * ------------------------------------------------------
       * 2. Fetch student profile
       * ------------------------------------------------------
       */
      if (detectedRole === 'student') {
        const {
          data: profileRaw,
          error: profileFetchError,
        } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (profileFetchError) {
          console.error(
            'Error fetching student profile:',
            profileFetchError
          );

          setProfile(null);
          return;
        }

        const studentProfile =
          profileRaw as unknown as StudentProfile | null;

        setProfile(studentProfile);
      } else {
        /*
         * Admin or unknown role doesn't need
         * a student profile.
         */
        setProfile(null);
      }
    } catch (error) {
      console.error(
        'Error fetching role/profile:',
        error
      );

      setRole(null);
      setProfile(null);
    }
  };

  /**
   * Manually refresh the current user's role/profile.
   */
  const refreshRoleAndProfile = async () => {
    if (!user) {
      setRole(null);
      setProfile(null);
      return;
    }

    await fetchRoleAndProfile(user.id);
  };

  /**
   * Initial authentication check
   * + listen for auth state changes.
   */
  useEffect(() => {
    let mounted = true;

    /*
     * --------------------------------------------------------
     * Initial authentication
     * --------------------------------------------------------
     */
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        const currentUser =
          session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await fetchRoleAndProfile(
            currentUser.id
          );
        } else {
          setRole(null);
          setProfile(null);
        }
      } catch (error) {
        console.error(
          'Error initializing authentication:',
          error
        );

        if (mounted) {
          setUser(null);
          setRole(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    /*
     * --------------------------------------------------------
     * Authentication state listener
     *
     * Explicit types prevent:
     *
     * TS7006:
     * Parameter 'event' implicitly has an 'any' type.
     *
     * TS7006:
     * Parameter 'session' implicitly has an 'any' type.
     * --------------------------------------------------------
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (
        event: AuthChangeEvent,
        session: Session | null
      ) => {
        const currentUser =
          session?.user ?? null;

        if (!mounted) return;

        setUser(currentUser);

        if (currentUser) {
          /*
           * Fetch role/profile whenever a valid
           * authenticated session exists.
           */
          if (
            event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED' ||
            event === 'INITIAL_SESSION'
          ) {
            await fetchRoleAndProfile(
              currentUser.id
            );
          }
        } else {
          setRole(null);
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    /*
     * --------------------------------------------------------
     * Cleanup
     * --------------------------------------------------------
     */
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  /**
   * ADMIN SIGNUP
   *
   * Keep this for your current system.
   *
   * IMPORTANT:
   * For production, public admin signup should be
   * removed/restricted. Admin accounts should ideally
   * be created separately.
   */
  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:
            fullName?.trim() || '',
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error(
        'Sign up failed: no user returned'
      );
    }

    /*
     * Create admin role.
     */
    const {
      error: roleError,
    } = await supabase
      .from('user_roles')
      .insert([
        {
          user_id: authData.user.id,
          role: 'admin',
        } as never,
      ]);

    if (roleError) {
      throw new Error(roleError.message);
    }
  };

  /**
   * STUDENT SIGNUP
   *
   * Flow:
   * 1. Creates Auth user
   * 2. Assigns student role
   * 3. Creates admissions application
   * 4. Student profile is created later during approval
   */
  const signUpStudent = async (
    email: string,
    password: string,
    data: SignUpStudentData
  ) => {
    const normalizedEmail =
      email.trim().toLowerCase();

    /*
     * --------------------------------------------------------
     * 1. Create Auth user
     * --------------------------------------------------------
     */
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name:
            data.full_name?.trim() || '',
          phone:
            data.phone?.trim() || '',
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error(
        'Student registration failed: no user was created.'
      );
    }

    /*
     * --------------------------------------------------------
     * 2. Ensure student role exists
     * --------------------------------------------------------
     *
     * A database trigger may also create this row.
     * Duplicate errors are intentionally ignored.
     */
    try {
      const {
        error: roleInsertError,
      } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: authData.user.id,
            role: 'student',
          } as never,
        ]);

      if (roleInsertError) {
        const msg =
          roleInsertError.message || '';

        if (
          !msg
            .toLowerCase()
            .includes('duplicate') &&
          !msg
            .toLowerCase()
            .includes('unique')
        ) {
          console.warn(
            '[signUpStudent] user_roles insert warning:',
            roleInsertError
          );
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : String(err);

      if (
        !msg
          .toLowerCase()
          .includes('duplicate') &&
        !msg
          .toLowerCase()
          .includes('unique')
      ) {
        console.warn(
          '[signUpStudent] user_roles insert warning:',
          msg
        );
      }
    }

    /*
     * --------------------------------------------------------
     * 3. Create student profile (basic info, no category yet)
     * --------------------------------------------------------
     *
     * The student will complete their course/category
     * selection from the dashboard after logging in.
     */
    try {
      const {
        error: profileError,
      } = await (supabase as any)
        .from('student_profiles')
        .insert([
          {
            user_id: authData.user.id,
            full_name: data.full_name?.trim() || '',
            email: normalizedEmail,
            phone: data.phone?.trim() || null,
            date_of_birth: data.date_of_birth || null,
            parent_name: data.parent_name?.trim() || null,
            parent_phone: data.parent_phone?.trim() || null,
            address: data.address?.trim() || null,
            is_approved: false,
            is_active: false,
          } as never,
        ]);

      if (profileError) {
        const msg = profileError.message || '';

        if (
          !msg.toLowerCase().includes('duplicate') &&
          !msg.toLowerCase().includes('unique')
        ) {
          console.warn(
            '[signUpStudent] student_profiles insert warning:',
            profileError
          );
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : String(err);

      if (
        !msg.toLowerCase().includes('duplicate') &&
        !msg.toLowerCase().includes('unique')
      ) {
        console.warn(
          '[signUpStudent] student_profiles insert warning:',
          msg
        );
      }
    }

    /*
     * --------------------------------------------------------
     * 4. Create pending admissions application (basic info)
     * --------------------------------------------------------
     *
     * Category-specific fields are NOT included here because
     * the student hasn't selected a course yet. The full
     * admission with course details is created when the
     * student completes their profile from the dashboard.
     */
    const {
      error: admError,
    } = await (supabase as any)
      .from('admissions')
      .insert([
        {
          student_name: data.full_name?.trim() || '',
          email: normalizedEmail,
          phone: data.phone?.trim() || null,
          parent_name: data.parent_name?.trim() || null,
          parent_phone: data.parent_phone?.trim() || null,
          address: data.address?.trim() || null,
          date_of_birth: data.date_of_birth || null,
          status: 'pending',
          message: null,
        } as never,
      ]);

    if (admError) {
      console.error(
        '[signUpStudent] admissions insert error:',
        admError
      );
    }
  };

  /**
   * LOGIN
   */
  const signIn = async (
    email: string,
    password: string
  ) => {
    const {
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  /**
   * LOGOUT
   */
  const signOut = async () => {
    const {
      error,
    } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    setUser(null);
    setRole(null);
    setProfile(null);
  };

  /*
   * --------------------------------------------------------
   * Context Provider
   * --------------------------------------------------------
   */
  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profile,
        isLoading,
        signUp,
        signUpStudent,
        signIn,
        signOut,
        refreshRoleAndProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}