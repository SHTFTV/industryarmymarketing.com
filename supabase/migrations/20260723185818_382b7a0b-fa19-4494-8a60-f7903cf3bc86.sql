-- Move remaining RLS policies off public.has_role onto private.has_role,
-- then lock down public.has_role so signed-in users can no longer execute it.
-- Edge functions continue to call it via the service role.

DROP POLICY IF EXISTS "Admins can view service leads" ON public.service_leads;
DROP POLICY IF EXISTS "Admins can update service leads" ON public.service_leads;

CREATE POLICY "Admins can view service leads"
  ON public.service_leads
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update service leads"
  ON public.service_leads
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- Revoke EXECUTE on the exposed public.has_role from anon/authenticated/public
-- so it is no longer a signed-in-callable SECURITY DEFINER surface via PostgREST.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;