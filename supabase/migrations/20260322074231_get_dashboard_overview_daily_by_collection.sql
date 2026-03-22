-- US-B B1: Populate daily_by_collection (per-collection duplicate counting in breakdown only).
-- Same 7-day local window and range predicates as daily_totals (20260322032918).
-- Sparse JSON: omit (date, collection) rows where both added_count and read_count are 0.

CREATE INDEX IF NOT EXISTS idx_collection_links_link_id
  ON public.collection_links (link_id);

CREATE OR REPLACE FUNCTION public.get_dashboard_overview(p_tz text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_id uuid;
  v_today date;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_tz IS NULL OR btrim(p_tz) = '' THEN
    RAISE EXCEPTION 'Invalid timezone: empty';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = p_tz) THEN
    RAISE EXCEPTION 'Invalid timezone: %', p_tz;
  END IF;

  v_today := (now() AT TIME ZONE p_tz)::date;

  RETURN (
    WITH days AS (
      SELECT (v_today - (6 - i))::date AS d
      FROM generate_series(0, 6) AS g(i)
    ),
    added AS (
      SELECT
        (ls.created_at AT TIME ZONE p_tz)::date AS bucket_date,
        count(*)::bigint AS cnt
      FROM public.link_status ls
      WHERE ls.user_id = v_user_id
        AND ls.created_at >= ((v_today - 6)::timestamp AT TIME ZONE p_tz)
        AND ls.created_at < ((v_today + 1)::timestamp AT TIME ZONE p_tz)
      GROUP BY 1
    ),
    read_counts AS (
      SELECT
        (ls.read_at AT TIME ZONE p_tz)::date AS bucket_date,
        count(*)::bigint AS cnt
      FROM public.link_status ls
      WHERE ls.user_id = v_user_id
        AND ls.read_at IS NOT NULL
        AND ls.read_at >= ((v_today - 6)::timestamp AT TIME ZONE p_tz)
        AND ls.read_at < ((v_today + 1)::timestamp AT TIME ZONE p_tz)
      GROUP BY 1
    ),
    totals AS (
      SELECT coalesce(
        json_agg(
          json_build_object(
            'date', to_char(days.d, 'YYYY-MM-DD'),
            'added_count', coalesce(a.cnt, 0)::int,
            'read_count', coalesce(r.cnt, 0)::int
          )
          ORDER BY days.d
        ),
        '[]'::json
      ) AS j
      FROM days
      LEFT JOIN added a ON a.bucket_date = days.d
      LEFT JOIN read_counts r ON r.bucket_date = days.d
    ),
    added_by_collection AS (
      SELECT
        (ls.created_at AT TIME ZONE p_tz)::date AS bucket_date,
        c.id AS collection_id,
        count(*)::bigint AS cnt
      FROM public.link_status ls
      INNER JOIN public.collection_links cl ON cl.link_id = ls.link_id
      INNER JOIN public.collections c ON c.id = cl.collection_id AND c.user_id = v_user_id
      WHERE ls.user_id = v_user_id
        AND ls.created_at >= ((v_today - 6)::timestamp AT TIME ZONE p_tz)
        AND ls.created_at < ((v_today + 1)::timestamp AT TIME ZONE p_tz)
      GROUP BY 1, 2
    ),
    read_by_collection AS (
      SELECT
        (ls.read_at AT TIME ZONE p_tz)::date AS bucket_date,
        c.id AS collection_id,
        count(*)::bigint AS cnt
      FROM public.link_status ls
      INNER JOIN public.collection_links cl ON cl.link_id = ls.link_id
      INNER JOIN public.collections c ON c.id = cl.collection_id AND c.user_id = v_user_id
      WHERE ls.user_id = v_user_id
        AND ls.read_at IS NOT NULL
        AND ls.read_at >= ((v_today - 6)::timestamp AT TIME ZONE p_tz)
        AND ls.read_at < ((v_today + 1)::timestamp AT TIME ZONE p_tz)
      GROUP BY 1, 2
    ),
    by_collection_merged AS (
      SELECT
        coalesce(a.bucket_date, r.bucket_date) AS bucket_date,
        coalesce(a.collection_id, r.collection_id) AS collection_id,
        coalesce(a.cnt, 0)::bigint AS added_cnt,
        coalesce(r.cnt, 0)::bigint AS read_cnt
      FROM added_by_collection a
      FULL OUTER JOIN read_by_collection r
        ON a.bucket_date = r.bucket_date AND a.collection_id = r.collection_id
    ),
    by_collection_filtered AS (
      SELECT *
      FROM by_collection_merged
      WHERE added_cnt > 0 OR read_cnt > 0
    ),
    by_collection_json AS (
      SELECT coalesce(
        json_agg(
          json_build_object(
            'date', to_char(bucket_date, 'YYYY-MM-DD'),
            'collection_id', collection_id::text,
            'added_count', added_cnt::int,
            'read_count', read_cnt::int
          )
          ORDER BY bucket_date, collection_id
        ),
        '[]'::json
      ) AS j
      FROM by_collection_filtered
    )
    SELECT json_build_object(
      'daily_totals', (SELECT t.j FROM totals t),
      'daily_by_collection', (SELECT bc.j FROM by_collection_json bc),
      'daily_by_domain', '[]'::json
    )
  );
END;
$function$;
