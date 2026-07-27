ALTER TABLE public.seo_proposals
  ADD COLUMN IF NOT EXISTS owner_email_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS customer_email_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS owner_email_error TEXT,
  ADD COLUMN IF NOT EXISTS customer_email_error TEXT,
  ADD COLUMN IF NOT EXISTS owner_message_id TEXT,
  ADD COLUMN IF NOT EXISTS customer_message_id TEXT,
  ADD COLUMN IF NOT EXISTS email_attempted_at TIMESTAMPTZ;

ALTER TABLE public.seo_proposals
  DROP CONSTRAINT IF EXISTS seo_proposals_owner_email_status_chk,
  ADD CONSTRAINT seo_proposals_owner_email_status_chk
    CHECK (owner_email_status IN ('pending','sent','failed','skipped'));

ALTER TABLE public.seo_proposals
  DROP CONSTRAINT IF EXISTS seo_proposals_customer_email_status_chk,
  ADD CONSTRAINT seo_proposals_customer_email_status_chk
    CHECK (customer_email_status IN ('pending','sent','failed','skipped'));

CREATE INDEX IF NOT EXISTS seo_proposals_owner_email_status_idx
  ON public.seo_proposals (owner_email_status);
CREATE INDEX IF NOT EXISTS seo_proposals_customer_email_status_idx
  ON public.seo_proposals (customer_email_status);