-- Hardening: explicit REVOKE from anon (and authenticated on dispatch-only RPC).
-- Matches manual SQL applied on prod (Lovable). Idempotent.

-- disconnect_user_builder_api_key — UI / user JWT only (auth.uid() required)
REVOKE ALL ON FUNCTION public.disconnect_user_builder_api_key(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.disconnect_user_builder_api_key(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.disconnect_user_builder_api_key(text, text) TO authenticated;

-- save_user_builder_api_key — user JWT only
REVOKE ALL ON FUNCTION public.save_user_builder_api_key(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_user_builder_api_key(text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_user_builder_api_key(text, text, text) TO authenticated;

-- get_byoa_api_key_for_dispatch — Edge service_role only (never anon/authenticated)
REVOKE ALL ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) TO service_role;
