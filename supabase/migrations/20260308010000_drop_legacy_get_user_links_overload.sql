-- Drop the legacy get_user_links overload to avoid PostgREST RPC ambiguity.
-- PostgREST resolves RPCs by function name + named arguments, so keeping both
-- the 7-arg and 8-arg signatures causes HTTP 300 responses.
DROP FUNCTION IF EXISTS public.get_user_links(
  integer,
  integer,
  triage_status,
  boolean,
  integer,
  text,
  uuid
);
