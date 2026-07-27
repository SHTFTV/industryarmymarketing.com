
DROP POLICY IF EXISTS "Anyone can submit a service lead" ON public.service_leads;

CREATE POLICY "Public can submit a bid request"
ON public.service_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(name)) > 0
  AND char_length(trim(email)) > 3
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);
