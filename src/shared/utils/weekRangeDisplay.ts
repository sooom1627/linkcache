/**
 * ダッシュボード「直近7日」（6日前〜今日）の表示用。
 *
 * タイムゾーン: `Date` は端末のローカルタイムゾーンで解釈され、`Intl.DateTimeFormat`
 * の既定もローカルTZです。UTC の DB タイムスタンプを日単位で集計する場合は、
 * 集計側でも同じく「ユーザーローカルの暦日」でバケットする必要があります。
 *
 * 正午固定: 日付の加減時に DST 境界付近での日付ずれを避けるため、各日をローカル12:00 に正規化します。
 */

export function getLocalWeekWindowDates(now: Date = new Date()): Date[] {
  const dates: Date[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - offset);
    dates.push(d);
  }
  return dates;
}

export function formatWeekRangeLabel(
  language: string,
  now: Date = new Date(),
): string {
  const windowDates = getLocalWeekWindowDates(now);
  const start = windowDates[0];
  const end = windowDates[6];
  if (!start || !end) return "";
  const fmt = new Intl.DateTimeFormat(language, {
    month: "short",
    day: "numeric",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

/** 日〜土の英語1文字（S M T W T F S）。各列は7日窓内の実日付の曜日に対応 */
const EN_WEEKDAY_LETTER = ["S", "M", "T", "W", "T", "F", "S"] as const;

export function getEnglishWeekdayLetterLabels(
  now: Date = new Date(),
): string[] {
  return getLocalWeekWindowDates(now).map(
    (d) => EN_WEEKDAY_LETTER[d.getDay()]!,
  );
}
