-- Add announcement_text column if it doesn't exist
ALTER TABLE cms_settings 
ADD COLUMN IF NOT EXISTS announcement_text TEXT DEFAULT 'PRE-ORDER IS ON GOING ✦ Check Out Our Available Items ✦ ORDER NOW';

-- Ensure row with id=1 exists (without timestamp columns)
INSERT INTO cms_settings (id, announcement_text)
VALUES (
  1, 
  'PRE-ORDER IS ON GOING ✦ Check Out Our Available Items ✦ ORDER NOW'
)
ON CONFLICT (id) DO NOTHING;

-- Grant UPDATE permission to anon users (for public access)
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to CMS settings" ON cms_settings;
DROP POLICY IF EXISTS "Allow anon update to CMS settings" ON cms_settings;

-- Create policies for read and write
CREATE POLICY "Allow public read access to CMS settings"
ON cms_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow anon update to CMS settings"
ON cms_settings FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
