import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import {
  formatWeekRangeLabel,
  getEnglishWeekdayLetterLabels,
  getLocalWeekWindowDates,
} from "@/src/shared/utils/weekRangeDisplay";

/** アクティビティレベル: 0=なし, 1=低, 2=中, 3=高 */
type ActivityLevel = 0 | 1 | 2 | 3;

/** 週表示カレンダーウィジェット（デザインのみ）— ダッシュボード週チャートと同一の7日窓・書式 */
export function WeekCalendarWidget() {
  const { i18n } = useTranslation();
  const weekRangeLabel = formatWeekRangeLabel(i18n.language);
  const weekdayLabels = getEnglishWeekdayLetterLabels();
  const weekDates = getLocalWeekWindowDates();

  // 過去日のアクティビティ（サンプル: 4段階を複数日に分散）
  const activityByIndex: Record<number, ActivityLevel> = {
    0: 1, // 6日前: 低
    1: 0, // 5日前: なし
    2: 3, // 4日前: 高
    3: 2, // 3日前: 中
    4: 1, // 2日前: 低
    5: 3, // 1日前: 高
    // 6 = 今日（選択中、アクティビティは未確定）
  };

  return (
    <View className="rounded-2xl bg-slate-100 p-4">
      <Text className="mb-3 text-center text-base font-semibold text-slate-800">
        {weekRangeLabel}
      </Text>

      {/* 曜日ヘッダー（英語1文字・チャートX軸と同一） */}
      <View className="mb-2 flex-row justify-between">
        {weekdayLabels.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs font-medium text-slate-600">{label}</Text>
          </View>
        ))}
      </View>

      {/* 日付 */}
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
              {/* アクティビティインジケーター（4段階） */}
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
