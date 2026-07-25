
CREATE TABLE public.security_scan_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'manual_admin_rescan',
  finding_count INTEGER NOT NULL DEFAULT 0,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.security_scan_runs TO authenticated;
GRANT ALL ON public.security_scan_runs TO service_role;

ALTER TABLE public.security_scan_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security scan runs"
  ON public.security_scan_runs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert security scan runs"
  ON public.security_scan_runs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX security_scan_runs_generated_at_idx
  ON public.security_scan_runs (generated_at DESC);
