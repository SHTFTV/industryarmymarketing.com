
CREATE TABLE public.service_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL CHECK (service IN ('lead-generation','web-development','social-media','affordable-seo','dofollow-backlinks')),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) BETWEEN 3 AND 40),
  company TEXT CHECK (company IS NULL OR char_length(company) <= 200),
  city TEXT CHECK (city IS NULL OR char_length(city) <= 120),
  trade TEXT CHECK (trade IS NULL OR char_length(trade) <= 120),
  budget TEXT CHECK (budget IS NULL OR char_length(budget) <= 60),
  timeline TEXT CHECK (timeline IS NULL OR char_length(timeline) <= 60),
  project_description TEXT CHECK (project_description IS NULL OR char_length(project_description) <= 4000),
  session_id TEXT CHECK (session_id IS NULL OR char_length(session_id) <= 80),
  referrer TEXT CHECK (referrer IS NULL OR char_length(referrer) <= 500),
  user_agent TEXT CHECK (user_agent IS NULL OR char_length(user_agent) <= 500),
  page_path TEXT CHECK (page_path IS NULL OR char_length(page_path) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX service_leads_service_created_at_idx ON public.service_leads (service, created_at DESC);
CREATE INDEX service_leads_created_at_idx ON public.service_leads (created_at DESC);

GRANT INSERT ON public.service_leads TO anon;
GRANT INSERT ON public.service_leads TO authenticated;
GRANT ALL ON public.service_leads TO service_role;

ALTER TABLE public.service_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a bid request (public inquiry form); nobody can read via anon/authenticated.
-- Only service_role (edge functions, admin tooling) can read/update/delete.
CREATE POLICY "Anyone can submit a service lead"
ON public.service_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
