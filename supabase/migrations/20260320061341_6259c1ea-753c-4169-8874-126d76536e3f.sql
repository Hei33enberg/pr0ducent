-- builder_sync_data: stores latest synced info for each builder
CREATE TABLE public.builder_sync_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL UNIQUE,
  pricing_tiers JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  changelog JSONB DEFAULT '[]'::jsonb,
  official_url TEXT,
  docs_url TEXT,
  status TEXT DEFAULT 'active',
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  raw_perplexity_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.builder_sync_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read builder data" ON public.builder_sync_data FOR SELECT TO anon, authenticated USING (true);

-- blog_posts: AI-generated blog content
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT DEFAULT 'blog',
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  ai_model_used TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- notification_subscriptions: user opt-in for builder update alerts
CREATE TABLE public.notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_ids TEXT[] DEFAULT '{}',
  notify_changelog BOOLEAN DEFAULT true,
  notify_pricing BOOLEAN DEFAULT true,
  notify_blog BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subs" ON public.notification_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- user_notifications: actual notifications delivered to users
CREATE TABLE public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON public.user_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.user_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;