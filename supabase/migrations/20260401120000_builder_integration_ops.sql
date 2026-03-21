-- Sprint 4 backend follow-up: operational columns, validation RPC + trigger, indexes.

-- ---------------------------------------------------------------------------
-- Columns for admin UI + validation audit
-- ---------------------------------------------------------------------------
ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS display_name TEXT;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS config_validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS last_config_validation_at TIMESTAMPTZ;

COMMENT ON COLUMN public.builder_integration_config.display_name IS
  'Optional human label for admin / docs; falls back to tool_id.';

COMMENT ON COLUMN public.builder_integration_config.last_heartbeat IS
  'Last successful broker touch (poll or webhook apply) for this tool.';

COMMENT ON COLUMN public.builder_integration_config.config_validation_errors IS
  'JSON array of validation messages from validate_builder_integration_config().';

CREATE INDEX IF NOT EXISTS builder_integration_config_enabled_tier_idx
  ON public.builder_integration_config (enabled, tier)
  WHERE enabled = true;

-- ---------------------------------------------------------------------------
-- Validation: structural rules for live integrations (tier 1–2, enabled)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_builder_integration_config_row(
  r public.builder_integration_config
)
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  errs TEXT[] := ARRAY[]::TEXT[];
  it TEXT;
BEGIN
  IF r.enabled IS NOT TRUE OR r.tier > 2 THEN
    RETURN errs;
  END IF;

  -- v0 uses dedicated adapter + poll-v0-status
  IF r.tool_id = 'v0' AND r.tier = 1 THEN
    RETURN errs;
  END IF;

  it := COALESCE(NULLIF(btrim(r.integration_type), ''), 'manual');

  IF it = 'vbp' THEN
    IF r.api_base_url IS NULL OR btrim(r.api_base_url) = '' THEN
      errs := array_append(errs, 'vbp requires api_base_url');
    END IF;
  ELSIF it = 'rest_api' THEN
    IF r.api_base_url IS NULL OR btrim(r.api_base_url) = '' THEN
      errs := array_append(errs, 'rest_api requires api_base_url');
    END IF;
    IF r.response_id_path IS NULL OR btrim(r.response_id_path) = '' THEN
      errs := array_append(errs, 'rest_api requires response_id_path');
    END IF;
    IF r.poll_url_template IS NULL OR btrim(r.poll_url_template) = '' THEN
      errs := array_append(errs, 'rest_api requires poll_url_template for generic poll-builder-status');
    END IF;
  END IF;

  RETURN errs;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_builder_integration_config_on_enable()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  errs TEXT[];
BEGIN
  IF NEW.enabled IS NOT TRUE THEN
    RETURN NEW;
  END IF;
  errs := public.validate_builder_integration_config_row(NEW);
  IF array_length(errs, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'builder_integration_config validation failed: %', array_to_string(errs, '; ');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_builder_integration_config_validate_enable
  ON public.builder_integration_config;

CREATE TRIGGER trg_builder_integration_config_validate_enable
  BEFORE INSERT OR UPDATE ON public.builder_integration_config
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_builder_integration_config_on_enable();

-- ---------------------------------------------------------------------------
-- RPC: preview validation + persist snapshot (admins only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_builder_integration_config(p_tool_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  errs TEXT[];
  r public.builder_integration_config;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT * INTO r FROM public.builder_integration_config WHERE tool_id = p_tool_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'errors', jsonb_build_array('unknown_tool_id'));
  END IF;

  errs := public.validate_builder_integration_config_row(r);

  UPDATE public.builder_integration_config
  SET
    config_validation_errors = COALESCE(to_jsonb(errs), '[]'::jsonb),
    last_config_validation_at = now()
  WHERE tool_id = p_tool_id;

  IF array_length(errs, 1) IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'errors', '[]'::jsonb);
  END IF;

  RETURN jsonb_build_object('ok', false, 'errors', to_jsonb(errs));
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_builder_integration_config(TEXT) TO authenticated;
