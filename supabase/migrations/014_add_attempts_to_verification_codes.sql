-- Add attempts column to verification_codes to track failed code entry attempts and prevent brute force attacks
ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0;
