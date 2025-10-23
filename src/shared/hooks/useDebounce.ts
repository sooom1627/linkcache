import { useEffect, useState } from "react";

/**
 * 値をデバウンスするカスタムフック
 *
 * 入力値が変更されてから指定時間経過後に、デバウンスされた値を更新します。
 * タイピング中の連続した変更を抑制し、最後の値のみを伝播させます。
 *
 * @param value - デバウンスする値
 * @param delay - デバウンス遅延時間（ミリ秒、デフォルト: 500ms）
 * @returns デバウンスされた値
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * // debouncedSearchTermは500ms後に更新される
 * useEffect(() => {
 *   // API呼び出しなど
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 遅延後に値を更新
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // クリーンアップ：次の入力があれば前のタイマーをキャンセル
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
