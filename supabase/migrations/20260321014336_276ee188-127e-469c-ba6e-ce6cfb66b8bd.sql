-- Validation trigger for builder_integration_config on enable

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