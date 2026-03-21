-- Fix BYOA RPC grants: tighten to match intended security model

REVOKE ALL ON FUNCTION public.save_user_builder_api_key(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_user_builder_api_key(text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.save_user_builder_api_key(text, text, text) FROM service_role;
GRANT EXECUTE ON FUNCTION public.save_user_builder_api_key(text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_byoa_api_key_for_dispatch(uuid, text, text) TO service_role;