import { getLocalWeekWindowDates } from "@/src/shared/utils/weekRangeDisplay";

export function padSeriesToWeek(values: number[]): number[] {
  const v = [...values];
  while (v.length < 7) {
    v.push(0);
  }
  return v.slice(0, 7);
}

/** 0 = 6日前 … 6 = 今日（チャート・週ウィジェットと同じ基準） */
export function getCalendarDateForDayIndex(dayIndex: number): Date {
  const dates = getLocalWeekWindowDates();
  return dates[dayIndex] ?? dates[0]!;
}
