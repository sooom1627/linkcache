/**
 * Timezone Utility Module
 *
 * アプリケーション全体で使用する日時変換・フォーマット機能を提供します。
 *
 * 基本方針:
 * - データベース: 全てUTCで保存
 * - API送受信: UTC文字列（ISO 8601形式）
 * - UI表示: 端末のタイムゾーン・ロケールで表示
 *
 * @module shared/utils/timezone
 */

// ============================================================================
// 型定義
// ============================================================================

/**
 * 日付フォーマットのスタイル
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 */
export type DateFormatStyle = "short" | "medium" | "long" | "full";

/**
 * 日時フォーマットのオプション
 */
export interface FormatDateTimeOptions {
  /**
   * 日付部分のフォーマットスタイル
   * @default 'medium'
   */
  dateStyle?: DateFormatStyle;

  /**
   * 時刻部分のフォーマットスタイル
   * @default 'short'
   */
  timeStyle?: DateFormatStyle;

  /**
   * ロケール（言語・地域）
   * @default 端末のロケール（Intl.DateTimeFormat().resolvedOptions().locale）
   * @example 'ja-JP', 'en-US'
   */
  locale?: string;
}

/**
 * 相対時刻表示のオプション
 */
export interface FormatRelativeTimeOptions {
  /**
   * ロケール（言語・地域）
   * @default 端末のロケール
   * @example 'ja-JP', 'en-US'
   */
  locale?: string;

  /**
   * 表示スタイル
   * - 'long': "3 hours ago" (英語) / "3 時間前" (日本語) - フル表記
   * - 'short': "3 hr. ago" (英語) / "3 時間前" (日本語) - 短縮形（言語により異なる）
   * - 'narrow': "3h ago" (英語) / "3時間前" (日本語) - 最短形式
   * @default 'long'
   */
  style?: "long" | "short" | "narrow";
}

// ============================================================================
// 関数定義（実装は次のチケットで行います）
// ============================================================================

/**
 * 端末のタイムゾーンを取得
 *
 * @returns タイムゾーン識別子（例: "Asia/Tokyo", "America/New_York"）
 *
 * @example
 * ```typescript
 * const timezone = getDeviceTimezone();
 * console.log(timezone); // "Asia/Tokyo"
 * ```
 */
export function getDeviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * 入力された日時を `Date` オブジェクトに正規化
 */
function toValidDate(date: string | Date): Date | null {
  const parsedDate = typeof date === "string" ? new Date(date) : new Date(date);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

/**
 * ロケールを解決（省略時は端末設定を使用）
 */
function resolveLocale(locale?: string): string {
  return locale ?? getDeviceLocale();
}

function formatWithFallback(
  date: Date | null,
  fallback: string,
  formatterFactory: () => Intl.DateTimeFormat,
  context: string,
): string {
  if (!date) {
    console.error(`${context}: invalid date input`);
    return fallback;
  }

  try {
    return formatterFactory().format(date);
  } catch (error) {
    console.error(`${context}:`, error);
    return fallback;
  }
}

/**
 * UTC日時を端末のタイムゾーンでフォーマット表示
 *
 * @param utcDate - UTC日時（ISO 8601文字列またはDateオブジェクト）
 * @param options - フォーマットオプション
 * @returns フォーマットされた日時文字列
 *
 * @example
 * ```typescript
 * // DBから取得した UTC 文字列
 * const utcString = "2025-10-27T12:34:56.789Z";
 *
 * // 日本のユーザー: "2025/10/27 21:34"
 * formatDateTime(utcString);
 *
 * // カスタムフォーマット
 * formatDateTime(utcString, {
 *   dateStyle: 'full',
 *   timeStyle: 'medium',
 *   locale: 'en-US'
 * });
 * // "Monday, October 27, 2025 at 9:34:56 PM"
 * ```
 */
export function formatDateTime(
  utcDate: string | Date,
  options?: FormatDateTimeOptions,
): string {
  const date = toValidDate(utcDate);
  const dateStyle = options?.dateStyle ?? "medium";
  const timeStyle = options?.timeStyle ?? "short";
  const locale = resolveLocale(options?.locale);

  return formatWithFallback(
    date,
    "Invalid Date",
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle,
        timeStyle,
      }),
    "Error formatting date time",
  );
}

/**
 * 端末のロケールを取得（内部ヘルパー関数）
 */
function getDeviceLocale(): string {
  return Intl.DateTimeFormat().resolvedOptions().locale;
}

/**
 * UTC日時を日付のみフォーマット表示
 *
 * @param utcDate - UTC日時（ISO 8601文字列またはDateオブジェクト）
 * @param style - フォーマットスタイル
 * @param locale - ロケール（省略時は端末のロケール）
 * @returns フォーマットされた日付文字列
 *
 * @example
 * ```typescript
 * const utcString = "2025-10-27T12:34:56.789Z";
 *
 * // 日本: "2025/10/27"
 * formatDate(utcString);
 *
 * // アメリカ: "10/27/2025"
 * formatDate(utcString, 'short', 'en-US');
 * ```
 */
export function formatDate(
  utcDate: string | Date,
  style: DateFormatStyle = "medium",
  locale?: string,
): string {
  const date = toValidDate(utcDate);
  const targetLocale = resolveLocale(locale);

  return formatWithFallback(
    date,
    "Invalid Date",
    () =>
      new Intl.DateTimeFormat(targetLocale, {
        dateStyle: style,
      }),
    "Error formatting date",
  );
}

/**
 * UTC日時を時刻のみフォーマット表示
 *
 * @param utcDate - UTC日時（ISO 8601文字列またはDateオブジェクト）
 * @param style - フォーマットスタイル
 * @param locale - ロケール（省略時は端末のロケール）
 * @returns フォーマットされた時刻文字列
 *
 * @example
 * ```typescript
 * const utcString = "2025-10-27T12:34:56.789Z";
 *
 * // 日本: "21:34"
 * formatTime(utcString);
 *
 * // アメリカ: "9:34 PM"
 * formatTime(utcString, 'short', 'en-US');
 * ```
 */
export function formatTime(
  utcDate: string | Date,
  style: DateFormatStyle = "short",
  locale?: string,
): string {
  const date = toValidDate(utcDate);
  const targetLocale = resolveLocale(locale);

  return formatWithFallback(
    date,
    "Invalid Time",
    () =>
      new Intl.DateTimeFormat(targetLocale, {
        timeStyle: style,
      }),
    "Error formatting time",
  );
}

/**
 * UTC日時を相対時刻で表示（"2 hours ago" など）
 *
 * @param utcDate - UTC日時（ISO 8601文字列またはDateオブジェクト）
 * @param options - フォーマットオプション
 * @returns 相対時刻文字列
 *
 * @example
 * ```typescript
 * const utcString = "2025-10-27T10:34:56.789Z"; // 2時間前と仮定
 *
 * // 日本語: "2時間前"
 * formatRelativeTime(utcString, { locale: 'ja-JP' });
 *
 * // 英語: "2 hours ago"
 * formatRelativeTime(utcString, { locale: 'en-US' });
 *
 * // 短縮形: "2h ago"
 * formatRelativeTime(utcString, { style: 'narrow' });
 * ```
 */
export function formatRelativeTime(
  utcDate: string | Date,
  options?: FormatRelativeTimeOptions,
): string {
  const date = toValidDate(utcDate);

  if (!date) {
    console.error("Error formatting relative time: invalid date input");
    return "Invalid Date";
  }

  // 現在時刻との差分（ミリ秒）
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.trunc(diffMs / 1000);
  const diffMinutes = Math.trunc(diffSeconds / 60);
  const diffHours = Math.trunc(diffMinutes / 60);
  const diffDays = Math.trunc(diffHours / 24);
  const diffWeeks = Math.trunc(diffDays / 7);
  const diffMonths = Math.trunc(diffDays / 30);
  const diffYears = Math.trunc(diffDays / 365);

  // 適切な単位を選択
  let value: number;
  let unit: Intl.RelativeTimeFormatUnit;

  if (Math.abs(diffYears) >= 1) {
    value = diffYears;
    unit = "year";
  } else if (Math.abs(diffMonths) >= 1) {
    value = diffMonths;
    unit = "month";
  } else if (Math.abs(diffWeeks) >= 1) {
    value = diffWeeks;
    unit = "week";
  } else if (Math.abs(diffDays) >= 1) {
    value = diffDays;
    unit = "day";
  } else if (Math.abs(diffHours) >= 1) {
    value = diffHours;
    unit = "hour";
  } else if (Math.abs(diffMinutes) >= 1) {
    value = diffMinutes;
    unit = "minute";
  } else {
    value = diffSeconds;
    unit = "second";
  }

  // デフォルトオプション
  const locale = resolveLocale(options?.locale);
  const style = options?.style ?? "long";

  try {
    const formatter = new Intl.RelativeTimeFormat(locale, {
      numeric: "auto",
      style,
    });

    return formatter.format(value, unit);
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Invalid Date";
  }
}

/**
 * UTC日時を月名と日付でフォーマット表示（年なし）
 *
 * @param utcDate - UTC日時（ISO 8601文字列またはDateオブジェクト）
 * @param locale - ロケール（省略時は端末のロケール）
 * @returns フォーマットされた月日文字列
 *
 * @example
 * ```typescript
 * const utcString = "2025-10-27T12:34:56.789Z";
 *
 * // 英語: "October 27"
 * formatMonthDay(utcString, 'en-US');
 *
 * // 日本語: "10月27日"
 * formatMonthDay(utcString, 'ja-JP');
 *
 * // 端末のロケールで表示
 * formatMonthDay(utcString);
 * ```
 */
export function formatMonthDay(
  utcDate: string | Date,
  locale?: string,
): string {
  const date = toValidDate(utcDate);
  const targetLocale = resolveLocale(locale);

  return formatWithFallback(
    date,
    "Invalid Date",
    () =>
      new Intl.DateTimeFormat(targetLocale, {
        month: "long",
        day: "numeric",
      }),
    "Error formatting month and day",
  );
}

/**
 * ローカル日時をUTCに変換（ISO 8601形式で返す）
 *
 * @param localDate - ローカル日時のDateオブジェクト
 * @returns UTC文字列（ISO 8601形式）
 *
 * @example
 * ```typescript
 * const localDate = new Date(2025, 9, 27, 21, 34, 56); // 2025-10-27 21:34:56 JST
 *
 * const utcString = toUTC(localDate);
 * console.log(utcString); // "2025-10-27T12:34:56.000Z"
 * ```
 *
 * @note
 * 通常、データ保存時は `new Date().toISOString()` を使用すれば十分です。
 * この関数は特定のローカル日時をUTCに変換する必要がある場合に使用します。
 */
export function toUTC(localDate: Date): string {
  const date = toValidDate(localDate);

  if (!date) {
    const message = "Failed to convert date to UTC";
    console.error("Error converting to UTC: invalid date input");
    throw new Error(message);
  }

  // ISO 8601形式のUTC文字列を返す
  // toISOString()は常にUTCで返す（末尾に'Z'が付く）
  return date.toISOString();
}

// ============================================================================
// データ変換ヘルパー
// ============================================================================

/**
 * データ変換ヘルパー
 *
 * タイムスタンプフィールドを含むデータオブジェクトを変換するためのユーティリティ
 */
export const dataHelpers = {
  /**
   * データ配列のタイムスタンプフィールドを変換
   *
   * 各データオブジェクトの指定されたタイムスタンプフィールドを変換します。
   * 元のデータは変更せず、新しいオブジェクトを返します。
   *
   * @param data - 変換対象のデータ配列
   * @param timestampFields - 変換するタイムスタンプフィールド名の配列
   * @returns 変換されたデータ配列
   *
   * @example
   * ```typescript
   * const links = [
   *   { id: "1", triaged_at: "2025-01-01T12:00:00Z", read_at: null },
   *   { id: "2", triaged_at: null, read_at: "2025-01-02T12:00:00Z" },
   * ];
   *
   * const transformed = dataHelpers.transformTimestamps(links, [
   *   "triaged_at",
   *   "read_at",
   * ]);
   * ```
   */
  transformTimestamps: <T>(data: T[], timestampFields: (keyof T)[]): T[] => {
    return data.map((item) => {
      const transformed = { ...item };

      for (const field of timestampFields) {
        const value = item[field];

        // nullまたはundefinedの場合はそのまま
        if (value === null || value === undefined) {
          continue;
        }

        // 文字列の場合はDateオブジェクトに変換して検証
        if (typeof value === "string") {
          const date = toValidDate(value);
          if (date) {
            // 有効な日付の場合はそのまま保持（必要に応じて変換可能）
            // 現時点では元の文字列を保持
            transformed[field] = value as T[keyof T];
          }
        }
      }

      return transformed;
    });
  },
};
