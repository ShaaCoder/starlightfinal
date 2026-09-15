import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. Get student ID
     * ---------------------------------------------------------
     */
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Student ID is required.',
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. Get Authorization header
     *
     * Your admin page sends:
     *
     * Authorization: Bearer <access_token>
     * ---------------------------------------------------------
     */
    const authHeader =
      request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        {
          error:
            'Unauthorized. Authorization header is missing.',
        },
        { status: 401 }
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error:
            'Unauthorized. Invalid authorization format.',
        },
        { status: 401 }
      );
    }

    const accessToken =
      authHeader.substring(7).trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            'Unauthorized. Access token is missing.',
        },
        { status: 401 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. Environment variables
     * ---------------------------------------------------------
     */
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabaseServiceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error(
        '[DELETE STUDENT] Missing NEXT_PUBLIC_SUPABASE_URL'
      );

      return NextResponse.json(
        {
          error:
            'Server configuration error: Supabase URL is missing.',
        },
        { status: 500 }
      );
    }

    if (!supabaseAnonKey) {
      console.error(
        '[DELETE STUDENT] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );

      return NextResponse.json(
        {
          error:
            'Server configuration error: Supabase anon key is missing.',
        },
        { status: 500 }
      );
    }

    if (!supabaseServiceRoleKey) {
      console.error(
        '[DELETE STUDENT] Missing SUPABASE_SERVICE_ROLE_KEY'
      );

      return NextResponse.json(
        {
          error:
            'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing.',
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. Create Supabase client for authentication
     *
     * We explicitly provide the user's access token.
     * No middleware or cookies are required.
     * ---------------------------------------------------------
     */
    const supabaseAuth = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    /*
     * ---------------------------------------------------------
     * 5. Verify the logged-in user
     * ---------------------------------------------------------
     */
    const {
      data: {
        user,
      },
      error: userError,
    } = await supabaseAuth.auth.getUser(
      accessToken
    );

    if (userError || !user) {
      console.error(
        '[DELETE STUDENT] Authentication failed:',
        userError
      );

      return NextResponse.json(
        {
          error:
            'Unauthorized. Your session is invalid or expired.',
        },
        { status: 401 }
      );
    }

    console.log(
      '[DELETE STUDENT] Authenticated user:',
      user.id,
      user.email
    );

    /*
     * ---------------------------------------------------------
     * 6. Create Supabase Admin client
     *
     * IMPORTANT:
     * Service role key is server-only.
     * Never expose this key in NEXT_PUBLIC_* variables.
     * ---------------------------------------------------------
     */
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * ---------------------------------------------------------
     * 7. Verify current user is an ADMIN
     * ---------------------------------------------------------
     */
    const {
      data: roleData,
      error: roleError,
    } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError) {
      console.error(
        '[DELETE STUDENT] Role lookup failed:',
        roleError
      );

      return NextResponse.json(
        {
          error:
            'Unable to verify administrator permissions.',
        },
        { status: 500 }
      );
    }

    if (roleData?.role !== 'admin') {
      console.warn(
        '[DELETE STUDENT] Non-admin attempted deletion:',
        user.id
      );

      return NextResponse.json(
        {
          error:
            'Forbidden. Only administrators can delete students.',
        },
        { status: 403 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 8. Find student profile
     * ---------------------------------------------------------
     */
    const {
      data: student,
      error: studentError,
    } = await supabaseAdmin
      .from('student_profiles')
      .select(
        'id, user_id, full_name, email'
      )
      .eq('id', id)
      .maybeSingle();

    if (studentError) {
      console.error(
        '[DELETE STUDENT] Student lookup failed:',
        studentError
      );

      return NextResponse.json(
        {
          error:
            'Unable to find the student.',
        },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json(
        {
          error:
            'Student not found.',
        },
        { status: 404 }
      );
    }

    console.log(
      '[DELETE STUDENT] Student found:',
      {
        id: student.id,
        user_id: student.user_id,
        name: student.full_name,
        email: student.email,
      }
    );

    /*
     * ---------------------------------------------------------
     * 9. Prevent deleting yourself
     * ---------------------------------------------------------
     */
    if (student.user_id === user.id) {
      return NextResponse.json(
        {
          error:
            'You cannot delete your own administrator account.',
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 10. Detach admissions records
     *
     * admissions.student_profile_id
     * references student_profiles.id.
     *
     * We must remove this relationship before deleting
     * the student profile.
     * ---------------------------------------------------------
     */
    const {
      error: admissionDetachError,
    } = await supabaseAdmin
      .from('admissions')
      .update({
        student_profile_id: null,
      })
      .eq(
        'student_profile_id',
        student.id
      );

    if (admissionDetachError) {
      console.error(
        '[DELETE STUDENT] Admission detach failed:',
        admissionDetachError
      );

      return NextResponse.json(
        {
          error:
            'Could not detach the student from admission records.',
          details:
            admissionDetachError.message,
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 11. Delete student profile
     * ---------------------------------------------------------
     */
    const {
      error: profileDeleteError,
    } = await supabaseAdmin
      .from('student_profiles')
      .delete()
      .eq('id', student.id);

    if (profileDeleteError) {
      console.error(
        '[DELETE STUDENT] Profile deletion failed:',
        profileDeleteError
      );

      return NextResponse.json(
        {
          error:
            'Could not delete the student profile.',
          details:
            profileDeleteError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      '[DELETE STUDENT] Student profile deleted:',
      student.id
    );

    /*
     * ---------------------------------------------------------
     * 12. Delete Supabase Auth user
     * ---------------------------------------------------------
     */
    const {
      error: authDeleteError,
    } = await supabaseAdmin.auth.admin.deleteUser(
      student.user_id
    );

    if (authDeleteError) {
      console.error(
        '[DELETE STUDENT] Auth account deletion failed:',
        authDeleteError
      );

      /*
       * At this point the profile has already been deleted.
       *
       * Return a clear message so the admin knows that
       * the Auth account still needs attention.
       */
      return NextResponse.json(
        {
          error:
            'Student profile was deleted, but the login account could not be deleted.',
          details:
            authDeleteError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      '[DELETE STUDENT] Auth account deleted:',
      student.user_id
    );

    /*
     * ---------------------------------------------------------
     * 13. Success
     * ---------------------------------------------------------
     */
    return NextResponse.json(
      {
        success: true,
        message:
          'Student profile and login account deleted successfully.',
        student: {
          id: student.id,
          user_id: student.user_id,
          full_name: student.full_name,
          email: student.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      '[DELETE STUDENT] Unexpected error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error.',
      },
      { status: 500 }
    );
  }
}