-- Attach trigger for auto-creating profiles + subscriptions on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Allow service role to update subscriptions (for webhook)
CREATE POLICY "Service role can update subscriptions"
  ON public.subscriptions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);