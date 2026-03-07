import { Text, View } from "react-native";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/** 週表示カレンダーウィジェット（デザインのみ） */
export function WeekCalendarWidget() {
  const now = new Date();
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();

  // 今週の日付（1〜7のサンプル表示）
  const weekDates = [1, 2, 3, 4, 5, 6, 7];
  const selectedDay = 3;
  const daysWithActivity = [1, 3, 4, 7];

  return (
    <View className="rounded-2xl bg-slate-100 p-4">
      <Text className="mb-3 text-center text-base font-semibold text-slate-800">
        {monthName} {year}
      </Text>

      {/* 曜日ヘッダー */}
      <View className="mb-2 flex-row justify-between">
        {DAY_LABELS.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs font-medium text-slate-600">{label}</Text>
          </View>
        ))}
      </View>

      {/* 日付 */}
      <View className="flex-row justify-between">
        {weekDates.map((day) => {
          const isSelected = day === selectedDay;
          const hasActivity = daysWithActivity.includes(day);

          return (
            <View key={day} className="flex-1 items-center">
              <View
                className={`size-8 items-center justify-center rounded-full ${
                  isSelected ? "bg-accent" : ""
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-white" : "text-slate-700"
                  }`}
                >
                  {day}
                </Text>
              </View>
              <View className="mt-1 size-1.5 items-center justify-center">
                {hasActivity && (
                  <View className="size-1.5 rounded-full bg-accent" />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
