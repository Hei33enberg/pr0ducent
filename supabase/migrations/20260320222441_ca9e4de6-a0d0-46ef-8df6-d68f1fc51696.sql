-- Auto-webhook: on INSERT to run_tasks, call process-task-queue via pg_net
-- Replaces manual Database Webhook configuration

CREATE OR REPLACE FUNCTION public.trigger_process_task_queue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _url text;
  _service_key text;
BEGIN
  _url := 'https://fhfkkxdjogkkobnsedyo.supabase.co/functions/v1/process-task-queue';
  _service_key := current_setting('supabase.service_role_key', true);

  -- If service_role_key not available via setting, use vault
  IF _service_key IS NULL OR _service_key = '' THEN
    SELECT decrypted_secret INTO _service_key
    FROM vault.decrypted_secrets
    WHERE name = 'service_role_key'
    LIMIT 1;
  END IF;

  -- Fire-and-forget POST via pg_net
  IF _service_key IS NOT NULL AND _service_key != '' THEN
    PERFORM net.http_post(
      url := _url,
      body := jsonb_build_object('run_job_id', NEW.run_job_id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || _service_key
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger (fire once per statement to batch, not per row)
DROP TRIGGER IF EXISTS trg_run_tasks_auto_dispatch ON public.run_tasks;
CREATE TRIGGER trg_run_tasks_auto_dispatch
  AFTER INSERT ON public.run_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_process_task_queue();