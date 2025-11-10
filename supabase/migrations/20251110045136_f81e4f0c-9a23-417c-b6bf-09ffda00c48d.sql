-- Drop the existing check constraint
ALTER TABLE social_assets DROP CONSTRAINT IF EXISTS social_assets_type_check;

-- Add the new check constraint with 'realestate' included
ALTER TABLE social_assets ADD CONSTRAINT social_assets_type_check 
  CHECK (type IN ('post', 'reels_short', 'reels_long', 'reels_deep', 'carousel', 'realestate'));