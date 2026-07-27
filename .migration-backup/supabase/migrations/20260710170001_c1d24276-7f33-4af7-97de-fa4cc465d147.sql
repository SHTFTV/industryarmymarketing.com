
CREATE TABLE public.proposal_email_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.seo_proposals(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('owner','customer','test')),
  recipient TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent','failed','skipped','pending')),
  message_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposal_email_attempts_proposal ON public.proposal_email_attempts(proposal_id, created_at DESC);
CREATE INDEX idx_proposal_email_attempts_status ON public.proposal_email_attempts(status);

GRANT SELECT ON public.proposal_email_attempts TO authenticated;
GRANT ALL ON public.proposal_email_attempts TO service_role;

ALTER TABLE public.proposal_email_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email attempts"
  ON public.proposal_email_attempts
  FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::app_role));
