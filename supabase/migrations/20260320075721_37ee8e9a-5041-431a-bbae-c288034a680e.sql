-- Remove UPDATE policy on subscriptions (prevent front-end overrides)
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

-- Add INSERT policy so trigger can create subscription rows  
DROP POLICY IF EXISTS "Service can insert subscriptions" ON public.subscriptions;
CREATE POLICY "Service can insert subscriptions"
  ON public.subscriptions
  FOR INSERT
  TO public
  WITH CHECK (true);