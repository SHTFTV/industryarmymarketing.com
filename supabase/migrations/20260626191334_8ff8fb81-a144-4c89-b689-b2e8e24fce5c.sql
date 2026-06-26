CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.touch_user_trade_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.touch_user_trade_preferences_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.touch_user_trade_preferences_updated_at() TO service_role;

DROP TRIGGER IF EXISTS user_trade_preferences_touch_updated_at ON public.user_trade_preferences;
CREATE TRIGGER user_trade_preferences_touch_updated_at
BEFORE UPDATE ON public.user_trade_preferences
FOR EACH ROW EXECUTE FUNCTION private.touch_user_trade_preferences_updated_at();

DROP FUNCTION IF EXISTS public.touch_user_trade_preferences_updated_at();