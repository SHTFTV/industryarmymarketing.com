-- Blog posts table: the entire rich post lives in `data` JSONB to preserve
-- the existing rich content shape (richContent, faqs, cta, timeline, etc.).
-- Structured columns are only for fields we filter/sort/index on.

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_slug_len CHECK (length(slug) BETWEEN 1 AND 200),
  CONSTRAINT blog_posts_title_len CHECK (length(title) BETWEEN 1 AND 300)
);

CREATE INDEX blog_posts_published_at_idx ON public.blog_posts (published_at DESC);
CREATE INDEX blog_posts_is_published_idx ON public.blog_posts (is_published);
CREATE INDEX blog_posts_is_featured_idx ON public.blog_posts (is_featured) WHERE is_featured;
CREATE INDEX blog_posts_display_order_idx ON public.blog_posts (display_order NULLS LAST);

-- GRANTs: public reads for the sitemap, RSS, and blog pages (SPA); writes for admins.
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. logged out) can read published posts.
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Admins can read every row (including drafts) via a separate permissive policy.
CREATE POLICY "Admins can view all posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- Admin-only write access.
CREATE POLICY "Admins can insert posts"
  ON public.blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete posts"
  ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_blog_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_blog_posts_updated_at();