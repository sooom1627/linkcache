-- US-C C1: Populate daily_by_domain (extractDomain-equivalent host; top 15 domains by 7-day
-- (added+read) activity with rollup to __other__). daily_totals and daily_by_collection bodies
-- match 20260322080212 (unchanged semantics).
-- NOTE: `new`/`done`-only filters on domain CTEs were removed in 20260323120000_dashboard_overview_domain_align_totals.sql
-- so domain added/read match daily_totals population.

CREATE OR REPLACE FUNCTION public.extract_domain_for_dashboard(p_url text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $extract$
DECLARE
  v_raw text;
  v_rest text;
  v_auth text;
  v_host text;
  v_m text[];
BEGIN
  IF p_url IS NULL THEN
    RETURN '';
  END IF;

  v_raw := btrim(p_url);
  IF v_raw = '' THEN
    RETURN '';
  END IF;

  IF v_raw !~* '^[a-z][a-z0-9+.-]*://' THEN
    RETURN '';
  END IF;

  v_rest := regexp_replace(v_raw, '^[a-z][a-z0-9+.-]*://', '', 'i');

  v_auth := split_part(v_rest, '/', 1);
  IF position('?' IN v_auth) > 0 THEN
    v_auth := split_part(v_auth, '?', 1);
  END IF;
  IF position('#' IN v_auth) > 0 THEN
    v_auth := split_part(v_auth, '#', 1);
  END IF;

  IF v_auth = '' THEN
    RETURN '';
  END IF;

  IF v_auth ~ '@' THEN
    v_auth := substring(v_auth from '@(.*)$');
  END IF;

  IF v_auth ~ '^\[' THEN
    v_m := regexp_match(v_auth, '^\[([^\]]+)\](?::([0-9]+))?$');
    IF v_m IS NULL THEN
      RETURN '';
    END IF;
    v_host := lower(v_m[1]);
    RETURN regexp_replace(v_host, '^www\.', '', 'i');
  END IF;

  v_m := regexp_match(v_auth, '^(.+):([0-9]+)$');
  IF v_m IS NOT NULL THEN
    v_host := v_m[1];
  ELSE
    v_host := v_auth;
  END IF;

  IF v_host = '' THEN
    RETURN '';
  END IF;

  RETURN regexp_replace(lower(v_host), '^www\.', '', 'i');
END;
$extract$;

CREATE INDEX IF NOT EXISTS idx_link_status_dashboard_domain_added
  ON public.link_status (user_id, created_at)
  WHERE status IN ('new'::public.triage_status, 'done'::public.triage_status);

CREATE INDEX IF NOT EXISTS idx_link_status_dashboard_domain_read
  ON public.link_status (user_id, read_at)
  WHERE status IN ('new'::public.triage_status, 'done'::public.triage_status)
    AND read_at IS NOT NULL;

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
    added_by_collection_current_membership AS (
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
    read_by_collection_current_membership AS (
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
      FROM added_by_collection_current_membership a
      FULL OUTER JOIN read_by_collection_current_membership r
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
    ),
    added_by_domain AS (
      SELECT
        (ls.created_at AT TIME ZONE p_tz)::date AS bucket_date,
        public.extract_domain_for_dashboard(l.url) AS domain,
        count(*)::bigint AS cnt
      FROM public.link_status ls
      INNER JOIN public.links l ON l.id = ls.link_id
      WHERE ls.user_id = v_user_id
        AND ls.status IN ('new'::public.triage_status, 'done'::public.triage_status)
        AND ls.created_at >= ((v_today - 6)::timestamp AT TIME ZONE p_tz)
        AND ls.created_at < ((v_today + 1)::timestamp AT TIME ZONE p_tz)
      GROUP BY 1, 2
    ),
    read_by_domain AS (
      SELECT
        (ls.read_at AT TIME ZONE p_tz)::date AS bucket_date,
        public.extract_domain_for_dashboard(l.url) AS domain,
        count(*)::bigint AS cnt
      FROM public.link_status ls
      INNER JOIN public.links l ON l.id = ls.link_id
      WHERE ls.user_id = v_user_id
        AND ls.status IN ('new'::public.triage_status, 'done'::public.triage_status)
        AND ls.read_at IS NOT NULL
        AND ls.read_at >= ((v_today - 6)::timestamp AT TIME ZONE p_tz)
        AND ls.read_at < ((v_today + 1)::timestamp AT TIME ZONE p_tz)
      GROUP BY 1, 2
    ),
    by_domain_merged AS (
      SELECT
        coalesce(a.bucket_date, r.bucket_date) AS bucket_date,
        coalesce(a.domain, r.domain) AS domain,
        coalesce(a.cnt, 0)::bigint AS added_cnt,
        coalesce(r.cnt, 0)::bigint AS read_cnt
      FROM added_by_domain a
      FULL OUTER JOIN read_by_domain r
        ON a.bucket_date = r.bucket_date AND a.domain IS NOT DISTINCT FROM r.domain
    ),
    by_domain_filtered AS (
      SELECT *
      FROM by_domain_merged
      WHERE added_cnt > 0 OR read_cnt > 0
    ),
    domain_rank_totals AS (
      SELECT
        domain,
        sum(added_cnt + read_cnt)::bigint AS activity
      FROM by_domain_filtered
      GROUP BY domain
    ),
    top_domains AS (
      SELECT d.domain
      FROM domain_rank_totals d
      ORDER BY d.activity DESC, d.domain ASC NULLS LAST
      LIMIT 15
    ),
    by_domain_remapped AS (
      SELECT
        f.bucket_date,
        CASE
          WHEN EXISTS (SELECT 1 FROM top_domains t WHERE t.domain IS NOT DISTINCT FROM f.domain)
          THEN f.domain
          ELSE '__other__'::text
        END AS domain,
        f.added_cnt,
        f.read_cnt
      FROM by_domain_filtered f
    ),
    by_domain_rolled AS (
      SELECT
        bucket_date,
        domain,
        sum(added_cnt)::bigint AS added_cnt,
        sum(read_cnt)::bigint AS read_cnt
      FROM by_domain_remapped
      GROUP BY 1, 2
    ),
    by_domain_filtered2 AS (
      SELECT *
      FROM by_domain_rolled
      WHERE added_cnt > 0 OR read_cnt > 0
    ),
    by_domain_json AS (
      SELECT coalesce(
        json_agg(
          json_build_object(
            'date', to_char(bucket_date, 'YYYY-MM-DD'),
            'domain', domain,
            'added_count', added_cnt::int,
            'read_count', read_cnt::int
          )
          ORDER BY bucket_date, domain
        ),
        '[]'::json
      ) AS j
      FROM by_domain_filtered2
    )
    SELECT json_build_object(
      'daily_totals', (SELECT t.j FROM totals t),
      'daily_by_collection', (SELECT bc.j FROM by_collection_json bc),
      'daily_by_domain', (SELECT bd.j FROM by_domain_json bd)
    )
  );
END;
$function$;
