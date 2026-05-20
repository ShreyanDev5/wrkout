-- Create verification_codes table for password recovery
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT code_length CHECK (length(code) = 6)
);

-- Create indexes for efficient queries
CREATE INDEX idx_verification_codes_email ON verification_codes(email);
CREATE INDEX idx_verification_codes_email_unused ON verification_codes(email) WHERE used_at IS NULL;
CREATE INDEX idx_verification_codes_created_at ON verification_codes(created_at);

-- Add policy: Only service role can insert/update
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON verification_codes
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
