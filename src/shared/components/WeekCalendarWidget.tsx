import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import {
  formatWeekRangeLabel,
  getEnglishWeekdayLetterLabels,
  getLocalWeekWindowDates,
} from "@/src/shared/utils/weekRangeDisplay";

/** Activity level: 0=none, 1=low, 2=medium, 3=high */
type ActivityLevel = 0 | 1 | 2 | 3;

/** Week view calendar widget (design only) — same 7-day window and format as dashboard week chart */
export function WeekCalendarWidget() {
  const { i18n } = useTranslation();
  const weekRangeLabel = formatWeekRangeLabel(i18n.language);
  const weekdayLabels = getEnglishWeekdayLetterLabels();
  const weekDates = getLocalWeekWindowDates();

  // Sample activity for past days (four levels spread across multiple days)
  const activityByIndex: Record<number, ActivityLevel> = {
    0: 1, // 6 days ago: low
    1: 0, // 5 days ago: none
    2: 3, // 4 days ago: high
    3: 2, // 3 days ago: medium
    4: 1, // 2 days ago: low
    5: 3, // 1 day ago: high
    // 6 = today (selected, activity TBD)
  };

  return (
    <View className="rounded-2xl bg-slate-100 p-4">
      <Text className="mb-3 text-center text-base font-semibold text-slate-800">
        {weekRangeLabel}
      </Text>

      {/* Weekday header (single English letter, same as chart X-axis) */}
      <View className="mb-2 flex-row justify-between">
        {weekdayLabels.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs font-medium text-slate-600">{label}</Text>
          </View>
        ))}
      </View>

      {/* Dates */}
      <View className="flex-row justify-between">
        {weekDates.map((date, index) => {
          const isToday = index === 6;
          const activityLevel = activityByIndex[index] ?? 0;

          return (
            <View key={index} className="flex-1 items-center">
              <View
                className={`size-8 items-center justify-center rounded-full ${
                  isToday ? "bg-accent" : ""
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isToday ? "text-white" : "text-slate-700"
                  }`}
                >
                  {date.getDate()}
                </Text>
              </View>
              {/* Activity indicator (four levels) */}
              <View className="mt-1.5 flex-row items-center justify-center gap-0.5">
                {[1, 2, 3].map((level) => (
                  <View
                    key={level}
                    className={`size-1 rounded-full ${
                      activityLevel >= level ? "bg-accent" : "bg-slate-200"
                    }`}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
