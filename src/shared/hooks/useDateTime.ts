import { useEffect, useState } from "react";

import { formatMonthDay, formatTime } from "@/src/shared/utils/timezone";

/**
 * リアルタイムで時刻をフォーマットして返すフック
 * 1分ごとに自動更新される
 */
export function useFormattedTime(
  format: "short" | "long" = "long",
): string | null {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  useEffect(() => {
    // 初回実行
    const updateTime = () => {
      setFormattedTime(formatTime(new Date(), format));
    };
    updateTime();

    // 1分ごとに更新
    const intervalId = setInterval(updateTime, 60000);

    // クリーンアップ
    return () => clearInterval(intervalId);
  }, [format]);

  return formattedTime;
}

/**
 * リアルタイムで月日をフォーマットして返すフック
 * 1分ごとに自動更新される（日付が変わった場合に対応）
 */
export function useFormattedMonthDay(): string | null {
  const [formattedMonthDay, setFormattedMonthDay] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // 初回実行
    const updateMonthDay = () => {
      setFormattedMonthDay(formatMonthDay(new Date()));
    };
    updateMonthDay();

    // 10分ごとに更新
    const intervalId = setInterval(updateMonthDay, 600000);

    // クリーンアップ
    return () => clearInterval(intervalId);
  }, []);

  return formattedMonthDay;
}
