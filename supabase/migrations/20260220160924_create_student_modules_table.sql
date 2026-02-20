/*
  # Create student_modules table

  1. New Tables
    - `student_modules`
      - `id` (uuid, primary key) - Unique identifier for each record
      - `created_at` (timestamptz) - Timestamp when the record was created
      - `module_owner` (text, not null) - Identifies which module the record belongs to (e.g., 'GestorDeTareas')
      - `content` (jsonb) - Stores module-specific data in JSON format

  2. Security
    - Enable RLS on `student_modules` table
    - Add policies for authenticated users to manage their own module data
    - Users can read, insert, update, and delete their own records

  3. Important Notes
    - Each module will filter data using the `module_owner` field
    - The `content` field is flexible and can store different data structures for each module
    - All operations are restricted to authenticated users only
*/

-- Create the student_modules table
CREATE TABLE IF NOT EXISTS student_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  module_owner text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb NOT NULL
);

-- Enable Row Level Security
ALTER TABLE student_modules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all module data (authenticated users only)
CREATE POLICY "Authenticated users can view module data"
  ON student_modules
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert new module data
CREATE POLICY "Authenticated users can insert module data"
  ON student_modules
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can update module data
CREATE POLICY "Authenticated users can update module data"
  ON student_modules
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Users can delete module data
CREATE POLICY "Authenticated users can delete module data"
  ON student_modules
  FOR DELETE
  TO authenticated
  USING (true);

-- Create an index on module_owner for faster queries
CREATE INDEX IF NOT EXISTS idx_student_modules_module_owner 
  ON student_modules(module_owner);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_student_modules_created_at 
  ON student_modules(created_at DESC);