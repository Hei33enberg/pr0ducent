
-- Builder pricing plans (detailed per-plan data)
CREATE TABLE public.builder_pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  monthly_price NUMERIC(10,2),
  annual_price NUMERIC(10,2),
  credits_included INTEGER,
  credit_unit TEXT,
  overage_cost NUMERIC(10,4),
  features JSONB DEFAULT '[]'::jsonb,
  promo_active BOOLEAN DEFAULT false,
  promo_description TEXT,
  promo_expires_at TIMESTAMPTZ,
  ai_models TEXT[] DEFAULT '{}',
  dev_environment TEXT,
  languages_supported TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tool_id, plan_name)
);

ALTER TABLE public.builder_pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read pricing plans" ON public.builder_pricing_plans FOR SELECT TO anon, authenticated USING (true);

-- Builder price history (daily snapshots)
CREATE TABLE public.builder_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  monthly_price NUMERIC(10,2),
  annual_price NUMERIC(10,2),
  credits_included INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.builder_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read price history" ON public.builder_price_history FOR SELECT TO anon, authenticated USING (true);

-- Run comments (social layer)
CREATE TABLE public.run_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.run_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments on public experiments" ON public.run_comments FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM experiments WHERE experiments.id = run_comments.experiment_id AND experiments.is_public = true)
);
CREATE POLICY "Authenticated users can comment" ON public.run_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.run_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Builder ratings
CREATE TABLE public.builder_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_id UUID,
  rating INTEGER NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tool_id, experiment_id)
);

-- Use a validation trigger instead of CHECK constraint for rating range
CREATE OR REPLACE FUNCTION public.validate_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_rating_range
  BEFORE INSERT OR UPDATE ON public.builder_ratings
  FOR EACH ROW EXECUTE FUNCTION public.validate_rating();

ALTER TABLE public.builder_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ratings" ON public.builder_ratings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can rate" ON public.builder_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.builder_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  prompts_used INTEGER DEFAULT 0,
  prompts_limit INTEGER DEFAULT 3,
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.subscriptions (user_id, plan, prompts_limit)
  VALUES (NEW.id, 'free', 3);
  RETURN NEW;
END;
$$;

-- Add is_free_run and session_id to experiments for anonymous runs
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS is_free_run BOOLEAN DEFAULT false;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Enable realtime for experiments (for Runs Now feed)
ALTER PUBLICATION supabase_realtime ADD TABLE public.experiments;
