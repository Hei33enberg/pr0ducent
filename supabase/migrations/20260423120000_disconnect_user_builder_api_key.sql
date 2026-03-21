-- BYOA: authenticated users can remove Vault secret and credential row (disconnect / revoke).

CREATE OR REPLACE FUNCTION public.disconnect_user_builder_api_key(
  p_tool_id text,
  p_credential_type text DEFAULT 'api_key'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  uid uuid := auth.uid();
  vref text;
  vault_name text;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_tool_id IS NULL OR length(trim(p_tool_id)) < 1 OR length(trim(p_tool_id)) > 256 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_tool_id');
  END IF;

  IF p_credential_type IS NULL OR p_credential_type NOT IN ('api_key') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unsupported_credential_type');
  END IF;

  vault_name := 'byoa_' || uid::text || '_' || md5(trim(p_tool_id) || ':' || p_credential_type);

  SELECT ubc.vault_ref INTO vref
  FROM public.user_builder_credentials ubc
  WHERE ubc.user_id = uid
    AND ubc.tool_id = trim(p_tool_id)
    AND ubc.credential_type = p_credential_type;

  IF vref IS NULL OR btrim(vref) = '' THEN
    RETURN jsonb_build_object('ok', true, 'removed', false);
  END IF;

  BEGIN
    DELETE FROM vault.secrets WHERE id = vref::uuid;
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END;

  DELETE FROM vault.secrets WHERE name = vault_name;

  DELETE FROM public.user_builder_credentials
  WHERE user_id = uid
    AND tool_id = trim(p_tool_id)
    AND credential_type = p_credential_type;

  RETURN jsonb_build_object('ok', true, 'removed', true);
END;
$$;

COMMENT ON FUNCTION public.disconnect_user_builder_api_key(text, text) IS
  'Deletes Vault secret and user_builder_credentials row for BYOA disconnect.';

REVOKE ALL ON FUNCTION public.disconnect_user_builder_api_key(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.disconnect_user_builder_api_key(text, text) TO authenticated;
