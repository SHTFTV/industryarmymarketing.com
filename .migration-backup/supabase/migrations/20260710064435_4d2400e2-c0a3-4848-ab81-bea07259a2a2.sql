
-- =========================================================================
-- seo_proposals: lead-capture for the SEO package estimator + order flow
-- =========================================================================
CREATE TABLE public.seo_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  target_url TEXT,
  keywords TEXT,
  budget INTEGER NOT NULL DEFAULT 0,
  competition TEXT NOT NULL DEFAULT 'medium',
  target_urls INTEGER NOT NULL DEFAULT 1,
  city_population INTEGER NOT NULL DEFAULT 0,
  package_slug TEXT NOT NULL,
  package_price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT NOT NULL DEFAULT 'estimator',
  notes TEXT,
  user_agent TEXT,
  referrer TEXT,
  emailed_customer BOOLEAN NOT NULL DEFAULT false,
  emailed_owner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT seo_proposals_competition_chk CHECK (competition IN ('low','medium','high')),
  CONSTRAINT seo_proposals_package_chk CHECK (package_slug IN ('bullets','boom','bombs')),
  CONSTRAINT seo_proposals_status_chk CHECK (status IN ('new','contacted','won','lost','archived')),
  CONSTRAINT seo_proposals_email_len CHECK (email IS NULL OR (length(email) BETWEEN 3 AND 255)),
  CONSTRAINT seo_proposals_name_len CHECK (name IS NULL OR length(name) <= 100),
  CONSTRAINT seo_proposals_target_url_len CHECK (target_url IS NULL OR length(target_url) <= 500),
  CONSTRAINT seo_proposals_keywords_len CHECK (keywords IS NULL OR length(keywords) <= 500),
  CONSTRAINT seo_proposals_notes_len CHECK (notes IS NULL OR length(notes) <= 4000)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_proposals TO authenticated;
GRANT INSERT ON public.seo_proposals TO anon;
GRANT ALL ON public.seo_proposals TO service_role;

ALTER TABLE public.seo_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a proposal"
  ON public.seo_proposals
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(package_slug) > 0
    AND (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  );

CREATE POLICY "Admins can view proposals"
  ON public.seo_proposals
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update proposals"
  ON public.seo_proposals
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete proposals"
  ON public.seo_proposals
  FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX seo_proposals_created_at_idx ON public.seo_proposals (created_at DESC);
CREATE INDEX seo_proposals_status_idx ON public.seo_proposals (status);
CREATE INDEX seo_proposals_pkg_idx ON public.seo_proposals (package_slug);

CREATE OR REPLACE FUNCTION public.tg_seo_proposals_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER seo_proposals_updated_at
  BEFORE UPDATE ON public.seo_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_seo_proposals_updated_at();

-- =========================================================================
-- seo_events: analytics events
-- =========================================================================
CREATE TABLE public.seo_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  session_id TEXT,
  path TEXT,
  package_slug TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT seo_events_event_len CHECK (length(event) BETWEEN 1 AND 80),
  CONSTRAINT seo_events_session_len CHECK (session_id IS NULL OR length(session_id) <= 100),
  CONSTRAINT seo_events_path_len CHECK (path IS NULL OR length(path) <= 500)
);

GRANT INSERT ON public.seo_events TO anon, authenticated;
GRANT SELECT ON public.seo_events TO authenticated;
GRANT ALL ON public.seo_events TO service_role;

ALTER TABLE public.seo_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log an event"
  ON public.seo_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (length(event) BETWEEN 1 AND 80);

CREATE POLICY "Admins can view events"
  ON public.seo_events
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX seo_events_created_at_idx ON public.seo_events (created_at DESC);
CREATE INDEX seo_events_event_idx ON public.seo_events (event);
CREATE INDEX seo_events_pkg_idx ON public.seo_events (package_slug);
