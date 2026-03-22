-- Narrow added/read_counts to 7-day local window before GROUP BY (index-friendly range scan).

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
    )
    SELECT json_build_object(
      'daily_totals', (SELECT t.j FROM totals t),
      'daily_by_collection', '[]'::json,
      'daily_by_domain', '[]'::json
    )
  );
END;
$function$;
