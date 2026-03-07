-- user_links_view を SECURITY INVOKER に変更
-- デフォルトの SECURITY DEFINER では view owner の権限で実行され、RLS がバイパスされる可能性がある
-- security_invoker = true により、クエリ実行ユーザーの権限と RLS が適用される
CREATE OR REPLACE VIEW user_links_view
  WITH (security_invoker = true)
AS
SELECT
  l.id AS link_id,
  l.url,
  l.title,
  l.description,
  l.image_url,
  l.favicon_url,
  l.site_name,
  l.created_at AS link_created_at,
  ls.id AS status_id,
  ls.user_id,
  ls.status,
  ls.triaged_at,
  ls.read_at,
  ls.created_at AS status_created_at
FROM links l
LEFT JOIN link_status ls ON l.id = ls.link_id;
