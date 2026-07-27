CREATE TABLE public.seo_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  status INTEGER,
  ttfb INTEGER,
  checks JSONB NOT NULL DEFAULT '[]'::jsonb,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  deep_dive JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX seo_audits_user_created_idx ON public.seo_audits (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_audits TO authenticated;
GRANT ALL ON public.seo_audits TO service_role;

ALTER TABLE public.seo_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own audits"
  ON public.seo_audits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);