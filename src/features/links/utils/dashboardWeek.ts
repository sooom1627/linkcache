import { getLocalWeekWindowDates } from "@/src/shared/utils/weekRangeDisplay";

export function padSeriesToWeek(values: number[]): number[] {
  const v = [...values];
  while (v.length < 7) {
    v.push(0);
  }
  return v.slice(0, 7);
}

/** 7日分の added/read 日次配列が揃っているか（バー選択・日内訳に必要） */
export function isValidAddedReadDayStatsPair(
  addedStatsByDay: unknown,
  readStatsByDay: unknown,
): boolean {
  return (
    Array.isArray(addedStatsByDay) &&
    addedStatsByDay.length === 7 &&
    Array.isArray(readStatsByDay) &&
    readStatsByDay.length === 7
  );
}

/** 0 = 6日前 … 6 = 今日（チャート・週ウィジェットと同じ基準） */
export function getCalendarDateForDayIndex(dayIndex: number): Date {
  const dates = getLocalWeekWindowDates();
  const max = dates.length - 1;
  if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex > max) {
    throw new Error(
      `getCalendarDateForDayIndex: invalid dayIndex ${String(dayIndex)} (expected integer in 0..${max}, dates.length=${dates.length})`,
    );
  }
  return dates[dayIndex]!;
}
