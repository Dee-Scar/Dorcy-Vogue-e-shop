-- Add new_arrival_products column to cms_settings table
ALTER TABLE cms_settings 
ADD COLUMN IF NOT EXISTS new_arrival_products text[] DEFAULT '{}';

-- Add a comment to describe the column
COMMENT ON COLUMN cms_settings.new_arrival_products IS 'Array of product names to display in New Arrivals section on homepage';
