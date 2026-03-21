-- BYOA: store API keys in Supabase Vault; only vault_ref (secret id) in public.user_builder_credentials.

CREATE OR REPLACE FUNCTION public.save_user_builder_api_key(
  p_tool_id text,
  p_credential_type text,
  p_plaintext_secret text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  uid uuid := auth.uid();
  old_ref text;
  new_id uuid;
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

  IF p_plaintext_secret IS NULL OR length(p_plaintext_secret) < 8 OR length(p_plaintext_secret) > 8192 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_secret');
  END IF;

  vault_name := 'byoa_' || uid::text || '_' || md5(trim(p_tool_id) || ':' || p_credential_type);

  SELECT ubc.vault_ref INTO old_ref
  FROM public.user_builder_credentials ubc
  WHERE ubc.user_id = uid
    AND ubc.tool_id = trim(p_tool_id)
    AND ubc.credential_type = p_credential_type;

  IF old_ref IS NOT NULL AND btrim(old_ref) <> '' THEN
    BEGIN
      DELETE FROM vault.secrets WHERE id = old_ref::uuid;
    EXCEPTION
      WHEN invalid_text_representation OR OTHERS THEN
        NULL;
    END;
  END IF;

  DELETE FROM vault.secrets WHERE name = vault_name;

  SELECT vault.create_secret(
    p_plaintext_secret,
    vault_name,
    'BYOA user API key'
  ) INTO new_id;

  INSERT INTO public.user_builder_credentials (user_id, tool_id, credential_type, vault_ref)
  VALUES (uid, trim(p_tool_id), p_credential_type, new_id::text)
  ON CONFLICT (user_id, tool_id, credential_type)
  DO UPDATE SET
    vault_ref = EXCLUDED.vault_ref,
    updated_at = now();

  RETURN jsonb_build_object('ok', true, 'vault_ref', new_id::text);
END;
$$;

COMMENT ON FUNCTION public.save_user_builder_api_key(text, text, text) IS
  'Stores BYOA secret in Vault and upserts user_builder_credentials.vault_ref (secret UUID).';

REVOKE ALL ON FUNCTION public.save_user_builder_api_key(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_user_builder_api_key(text, text, text) TO authenticated;


CREATE OR REPLACE FUNCTION public.get_byoa_api_key_for_dispatch(
  p_user_id uuid,
  p_tool_id text,
  p_credential_type text DEFAULT 'api_key'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  vref text;
  sec text;
BEGIN
  IF p_user_id IS NULL OR p_tool_id IS NULL OR length(trim(p_tool_id)) < 1 THEN
    RETURN NULL;
  END IF;

  SELECT ubc.vault_ref INTO vref
  FROM public.user_builder_credentials ubc
  WHERE ubc.user_id = p_user_id
    AND ubc.tool_id = trim(p_tool_id)
    AND ubc.credential_type = p_credential_type
  LIMIT 1;

  IF vref IS NULL OR btrim(vref) = '' THEN
    RETURN NULL;
  END IF;

  SELECT ds.decrypted_secret INTO sec
  FROM vault.decrypted_secrets ds
  WHERE ds.id = vref::uuid
  LIMIT 1;

  RETURN sec;
EXCEPTION
  WHEN invalid_text_representation THEN
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) IS
  'Returns decrypted BYOA API key for orchestration; callable only with service_role.';

REVOKE ALL ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) TO service_role;