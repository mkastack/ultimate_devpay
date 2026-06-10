
REVOKE EXECUTE ON FUNCTION public.validate_hire_request() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_hire_request() TO service_role;
