/*
# Extend admissions for the Starlight Academy paper form

1. New Columns
- `date_of_birth` stores the applicant's date of birth.
- `office_address` stores the father's or guardian's office address.
- `office_phone_1` and `office_phone_2` store both office contact numbers.
- `previous_qualification` stores the applicant's previous qualification.
- `school_college` stores the school or college last attended.
- `hobbies` stores hobbies and other interests.
- `photo_url` stores an optional applicant photo URL for admin records.

2. Modified Tables
- `public.admissions` receives the additional paper-form fields.
- Existing admission rows are preserved and new fields default to NULL.

3. Security
- Existing admissions RLS policies remain in place: public visitors may submit applications, while authenticated admin users may read, update, and delete them.

4. Important Notes
- This migration is additive and does not remove or rename any existing columns.
- Existing applications remain available with blank values for the new fields.
*/

ALTER TABLE public.admissions
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS office_address text,
  ADD COLUMN IF NOT EXISTS office_phone_1 text,
  ADD COLUMN IF NOT EXISTS office_phone_2 text,
  ADD COLUMN IF NOT EXISTS previous_qualification text,
  ADD COLUMN IF NOT EXISTS school_college text,
  ADD COLUMN IF NOT EXISTS hobbies text,
  ADD COLUMN IF NOT EXISTS photo_url text;

CREATE INDEX IF NOT EXISTS admissions_date_of_birth_idx
  ON public.admissions(date_of_birth);
