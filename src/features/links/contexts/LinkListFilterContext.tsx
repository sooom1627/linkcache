import { createContext, useContext, type ReactNode } from "react";

import {
  useLinkListFilter,
  type UseLinkListFilterReturn,
} from "../hooks/useLinkListFilter";

/**
 * リンク一覧フィルターのコンテキスト
 */
const LinkListFilterContext = createContext<UseLinkListFilterReturn | null>(
  null,
);

/**
 * リンク一覧フィルターのコンテキストプロバイダー
 *
 * LinkListScreen、LinkListFilterMenu、LinkListFilterModal間で
 * フィルター状態を共有するために使用します。
 */
export function LinkListFilterProvider({ children }: { children: ReactNode }) {
  const filterHook = useLinkListFilter();

  return (
    <LinkListFilterContext.Provider value={filterHook}>
      {children}
    </LinkListFilterContext.Provider>
  );
}

/**
 * リンク一覧フィルターのコンテキストを取得するフック
 *
 * @throws LinkListFilterProvider外で使用された場合にエラーをスロー
 * @returns フィルター状態と更新関数
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { filterState, setStatus } = useLinkListFilterContext();
 *   // ...
 * }
 * ```
 */
export function useLinkListFilterContext(): UseLinkListFilterReturn {
  const context = useContext(LinkListFilterContext);

  if (context === null) {
    throw new Error(
      "useLinkListFilterContext must be used within a LinkListFilterProvider",
    );
  }

  return context;
}
