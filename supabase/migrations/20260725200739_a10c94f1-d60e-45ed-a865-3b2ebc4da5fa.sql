
CREATE TABLE public.host_allowlist_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  version integer NOT NULL DEFAULT 1,
  source_context text,
  note text,
  decided_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX host_allowlist_requests_host_idx ON public.host_allowlist_requests (host, version DESC);

GRANT SELECT ON public.host_allowlist_requests TO authenticated;
GRANT INSERT, UPDATE ON public.host_allowlist_requests TO authenticated;
GRANT ALL ON public.host_allowlist_requests TO service_role;

ALTER TABLE public.host_allowlist_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view allowlist audit log"
  ON public.host_allowlist_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create allowlist requests"
  ON public.host_allowlist_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update allowlist requests"
  ON public.host_allowlist_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.tg_host_allowlist_requests_versioning()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.version := COALESCE(
      (SELECT MAX(version) + 1 FROM public.host_allowlist_requests WHERE host = NEW.host),
      1
    );
    NEW.updated_at := now();
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.decided_at IS NULL THEN
      NEW.decided_at := now();
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER host_allowlist_requests_versioning
  BEFORE INSERT OR UPDATE ON public.host_allowlist_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_host_allowlist_requests_versioning();
