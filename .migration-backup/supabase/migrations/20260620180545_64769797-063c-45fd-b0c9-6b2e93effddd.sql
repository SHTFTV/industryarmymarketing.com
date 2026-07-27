
CREATE TABLE public.user_trade_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  industry TEXT NOT NULL DEFAULT '',
  trade TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_trade_preferences TO authenticated;
GRANT ALL ON public.user_trade_preferences TO service_role;

ALTER TABLE public.user_trade_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own trade preference"
  ON public.user_trade_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_user_trade_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_trade_preferences_touch_updated_at
  BEFORE UPDATE ON public.user_trade_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_user_trade_preferences_updated_at();
