-- Atomic prompt charge for live dispatch (replaces SELECT-then-UPDATE race in Edge).

CREATE OR REPLACE FUNCTION public.subscription_try_increment_prompt(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_val integer;
BEGIN
  UPDATE public.subscriptions
  SET prompts_used = prompts_used + 1
  WHERE user_id = p_user_id
    AND prompts_used < prompts_limit
  RETURNING prompts_used INTO new_val;

  IF FOUND THEN
    RETURN jsonb_build_object('ok', true, 'prompts_used', new_val);
  END IF;

  IF EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = p_user_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'limit_exceeded');
  END IF;

  RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
END;
$$;

COMMENT ON FUNCTION public.subscription_try_increment_prompt(uuid) IS
  'Atomically increments prompts_used when under prompts_limit; used by dispatch-builders before run_jobs insert.';

GRANT EXECUTE ON FUNCTION public.subscription_try_increment_prompt(uuid) TO service_role;
