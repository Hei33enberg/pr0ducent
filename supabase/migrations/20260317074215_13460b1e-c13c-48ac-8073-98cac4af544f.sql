ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS use_case_tags text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Allow anyone to view public experiments (no auth required)
CREATE POLICY "Anyone can view public experiments"
ON public.experiments
FOR SELECT
TO anon, authenticated
USING (is_public = true);

-- Allow anyone to view runs of public experiments
CREATE POLICY "Anyone can view runs of public experiments"
ON public.experiment_runs
FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM experiments
  WHERE experiments.id = experiment_runs.experiment_id
  AND experiments.is_public = true
));