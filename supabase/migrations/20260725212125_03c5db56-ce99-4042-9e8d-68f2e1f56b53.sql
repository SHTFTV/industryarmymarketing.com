
CREATE TABLE public.submission_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  engine TEXT NOT NULL CHECK (engine IN ('indexnow','google_sitemap','google_inspect')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','retrying','exhausted')),
  http_status INT,
  response_body TEXT,
  error TEXT,
  attempt INT NOT NULL DEFAULT 1,
  max_attempts INT NOT NULL DEFAULT 5,
  next_retry_at TIMESTAMPTZ,
  trigger_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX submission_log_status_retry_idx ON public.submission_log(status, next_retry_at);
CREATE INDEX submission_log_created_at_idx ON public.submission_log(created_at DESC);
CREATE INDEX submission_log_url_idx ON public.submission_log(url);

GRANT SELECT ON public.submission_log TO authenticated;
GRANT ALL ON public.submission_log TO service_role;

ALTER TABLE public.submission_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view submission log"
  ON public.submission_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.tg_submission_log_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER submission_log_updated_at
  BEFORE UPDATE ON public.submission_log
  FOR EACH ROW EXECUTE FUNCTION public.tg_submission_log_updated_at();
