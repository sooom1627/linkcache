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
  try {
    // 文字列の場合はDateオブジェクトに変換
    const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;

    // 無効な日付をチェック
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    // デフォルトオプション
    const dateStyle = options?.dateStyle ?? "medium";
    const timeStyle = options?.timeStyle ?? "short";
    const locale = options?.locale ?? getDeviceLocale();

    // Intl.DateTimeFormatでフォーマット
    const formatter = new Intl.DateTimeFormat(locale, {
      dateStyle,
      timeStyle,
    });

    return formatter.format(date);
  } catch (error) {
    console.error("Error formatting date time:", error);
    return "Invalid Date";
  }
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
  try {
    // 文字列の場合はDateオブジェクトに変換
    const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;

    // 無効な日付をチェック
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    const targetLocale = locale ?? getDeviceLocale();

    // Intl.DateTimeFormatでフォーマット（日付のみ）
    const formatter = new Intl.DateTimeFormat(targetLocale, {
      dateStyle: style,
    });

    return formatter.format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
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
  try {
    // 文字列の場合はDateオブジェクトに変換
    const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;

    // 無効な日付をチェック
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    const targetLocale = locale ?? getDeviceLocale();

    // Intl.DateTimeFormatでフォーマット（時刻のみ）
    const formatter = new Intl.DateTimeFormat(targetLocale, {
      timeStyle: style,
    });

    return formatter.format(date);
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid Time";
  }
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
  try {
    // 文字列の場合はDateオブジェクトに変換
    const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;

    // 無効な日付をチェック
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    // 現在時刻との差分（ミリ秒）
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

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
    const locale = options?.locale ?? getDeviceLocale();
    const style = options?.style ?? "long";

    // Intl.RelativeTimeFormatでフォーマット
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
  try {
    // 無効な日付をチェック
    if (isNaN(localDate.getTime())) {
      throw new Error("Invalid date");
    }

    // ISO 8601形式のUTC文字列を返す
    // toISOString()は常にUTCで返す（末尾に'Z'が付く）
    return localDate.toISOString();
  } catch (error) {
    console.error("Error converting to UTC:", error);
    throw new Error("Failed to convert date to UTC");
  }
}
