-- add uncollected filter support to get_user_links
CREATE OR REPLACE FUNCTION public.get_user_links(
  p_page_size integer DEFAULT 20,
  p_page integer DEFAULT 0,
  p_status triage_status DEFAULT NULL::triage_status,
  p_is_read boolean DEFAULT NULL::boolean,
  p_limit integer DEFAULT NULL::integer,
  p_order_by text DEFAULT NULL::text,
  p_collection_id uuid DEFAULT NULL::uuid,
  p_uncollected_only boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_id UUID;
  v_offset INT;
  v_total_count INT;
  v_has_more BOOLEAN;
  v_data JSON;
  v_actual_limit INT;
  v_order_clause TEXT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_collection_id IS NOT NULL AND p_uncollected_only THEN
    RAISE EXCEPTION 'p_collection_id and p_uncollected_only cannot be used together';
  END IF;

  IF p_page_size < 1 OR p_page_size > 100 THEN
    RAISE EXCEPTION 'p_page_size must be between 1 and 100, got %', p_page_size;
  END IF;

  IF p_page < 0 THEN
    RAISE EXCEPTION 'p_page must be >= 0, got %', p_page;
  END IF;

  IF p_limit IS NOT NULL AND (p_limit <= 0 OR p_limit > 1000) THEN
    RAISE EXCEPTION 'p_limit must be between 1 and 1000 when provided, got %', p_limit;
  END IF;

  IF p_limit IS NOT NULL THEN
    v_actual_limit := p_limit;
    v_offset := 0;
  ELSE
    v_actual_limit := p_page_size;
    v_offset := p_page * p_page_size;
  END IF;

  IF p_order_by = 'triaged_at_asc' THEN
    v_order_clause := 'ORDER BY triaged_at ASC NULLS LAST';
  ELSE
    v_order_clause := 'ORDER BY status_created_at DESC NULLS LAST';
  END IF;

  SELECT COUNT(*)
  INTO v_total_count
  FROM public.user_links_view ulv
  WHERE ulv.user_id = v_user_id
    AND (p_status IS NULL OR ulv.status = p_status)
    AND (p_is_read IS NULL
         OR (p_is_read = true AND ulv.read_at IS NOT NULL)
         OR (p_is_read = false AND ulv.read_at IS NULL))
    AND (
      (NOT p_uncollected_only AND p_collection_id IS NULL)
      OR (
        NOT p_uncollected_only
        AND p_collection_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.collection_links cl
          WHERE cl.collection_id = p_collection_id
            AND cl.link_id = ulv.link_id
        )
      )
      OR (
        p_uncollected_only
        AND NOT EXISTS (
          SELECT 1
          FROM public.collection_links cl
          WHERE cl.link_id = ulv.link_id
        )
      )
    );

  EXECUTE format('
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT
        ulv.status_id,
        ulv.user_id,
        ulv.status,
        ulv.triaged_at,
        ulv.read_at,
        ulv.link_id,
        ulv.url,
        ulv.title,
        ulv.image_url,
        ulv.favicon_url,
        ulv.site_name,
        ulv.link_created_at
      FROM public.user_links_view ulv
      WHERE ulv.user_id = $1
        AND ($2::triage_status IS NULL OR ulv.status = $2::triage_status)
        AND ($3::boolean IS NULL
             OR ($3::boolean = true AND ulv.read_at IS NOT NULL)
             OR ($3::boolean = false AND ulv.read_at IS NULL))
        AND (
          (NOT $7::boolean AND $6::uuid IS NULL)
          OR (
            NOT $7::boolean
            AND $6::uuid IS NOT NULL
            AND EXISTS (
              SELECT 1
              FROM public.collection_links cl
              WHERE cl.collection_id = $6::uuid
                AND cl.link_id = ulv.link_id
            )
          )
          OR (
            $7::boolean
            AND NOT EXISTS (
              SELECT 1
              FROM public.collection_links cl
              WHERE cl.link_id = ulv.link_id
            )
          )
        )
      %s
      LIMIT $4
      OFFSET $5
    ) t',
    v_order_clause
  )
  INTO v_data
  USING
    v_user_id,
    p_status,
    p_is_read,
    v_actual_limit,
    v_offset,
    p_collection_id,
    p_uncollected_only;

  IF p_limit IS NOT NULL THEN
    v_has_more := false;
  ELSE
    v_has_more := (v_offset + p_page_size) < v_total_count;
  END IF;

  RETURN json_build_object(
    'data', COALESCE(v_data, '[]'::json),
    'hasMore', v_has_more,
    'totalCount', v_total_count
  );
END;
$function$;
