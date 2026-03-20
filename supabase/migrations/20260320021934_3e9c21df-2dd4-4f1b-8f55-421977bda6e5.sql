CREATE TABLE public.builder_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  tool_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  preview_url text,
  chat_url text,
  files jsonb DEFAULT '[]'::jsonb,
  generation_time_ms integer,
  error_message text,
  raw_response jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (experiment_id, tool_id)
);

ALTER TABLE public.builder_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their builder results"
ON public.builder_results FOR SELECT TO public
USING (EXISTS (
  SELECT 1 FROM experiments WHERE experiments.id = builder_results.experiment_id AND experiments.user_id = auth.uid()
));

CREATE POLICY "Anyone can view results of public experiments"
ON public.builder_results FOR SELECT TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM experiments WHERE experiments.id = builder_results.experiment_id AND experiments.is_public = true
));

CREATE POLICY "Users can insert their builder results"
ON public.builder_results FOR INSERT TO public
WITH CHECK (EXISTS (
  SELECT 1 FROM experiments WHERE experiments.id = builder_results.experiment_id AND experiments.user_id = auth.uid()
));

CREATE POLICY "Users can update their builder results"
ON public.builder_results FOR UPDATE TO public
USING (EXISTS (
  SELECT 1 FROM experiments WHERE experiments.id = builder_results.experiment_id AND experiments.user_id = auth.uid()
));

CREATE TRIGGER update_builder_results_updated_at
  BEFORE UPDATE ON public.builder_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();