import { act, renderHook } from "@testing-library/react-native";

import {
  useLinkListFilter,
  type LinkListFilterState,
} from "../../hooks/useLinkListFilter";

describe("useLinkListFilter", () => {
  describe("初期状態", () => {
    it("デフォルトではすべてのフィルターが'all'である", () => {
      const { result } = renderHook(() => useLinkListFilter());

      expect(result.current.filterState).toEqual({
        status: "all",
        readStatus: "all",
      });
    });

    it("初期値を指定できる", () => {
      const initialState: LinkListFilterState = {
        status: "inbox",
        readStatus: "unread",
      };
      const { result } = renderHook(() => useLinkListFilter(initialState));

      expect(result.current.filterState).toEqual(initialState);
    });
  });

  describe("ステータスフィルターの更新", () => {
    it("ステータスを'inbox'に更新できる", () => {
      const { result } = renderHook(() => useLinkListFilter());

      act(() => {
        result.current.setStatus("inbox");
      });

      expect(result.current.filterState.status).toBe("inbox");
    });

    it("ステータスを'read_soon'に更新できる", () => {
      const { result } = renderHook(() => useLinkListFilter());

      act(() => {
        result.current.setStatus("read_soon");
      });

      expect(result.current.filterState.status).toBe("read_soon");
    });

    it("ステータスを'later'に更新できる", () => {
      const { result } = renderHook(() => useLinkListFilter());

      act(() => {
        result.current.setStatus("later");
      });

      expect(result.current.filterState.status).toBe("later");
    });

    it("ステータスを'all'に戻せる", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "inbox", readStatus: "all" }),
      );

      act(() => {
        result.current.setStatus("all");
      });

      expect(result.current.filterState.status).toBe("all");
    });
  });

  describe("既読状態フィルターの更新", () => {
    it("既読状態を'unread'に更新できる", () => {
      const { result } = renderHook(() => useLinkListFilter());

      act(() => {
        result.current.setReadStatus("unread");
      });

      expect(result.current.filterState.readStatus).toBe("unread");
    });

    it("既読状態を'read'に更新できる", () => {
      const { result } = renderHook(() => useLinkListFilter());

      act(() => {
        result.current.setReadStatus("read");
      });

      expect(result.current.filterState.readStatus).toBe("read");
    });

    it("既読状態を'all'に戻せる", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "all", readStatus: "read" }),
      );

      act(() => {
        result.current.setReadStatus("all");
      });

      expect(result.current.filterState.readStatus).toBe("all");
    });
  });

  describe("フィルターのリセット", () => {
    it("すべてのフィルターをリセットできる", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "inbox", readStatus: "unread" }),
      );

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filterState).toEqual({
        status: "all",
        readStatus: "all",
      });
    });
  });

  describe("useLinksオプションへの変換", () => {
    it("'all'フィルターはundefinedに変換される", () => {
      const { result } = renderHook(() => useLinkListFilter());

      expect(result.current.useLinksOptions).toEqual({});
    });

    it("statusフィルターが正しく変換される", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "inbox", readStatus: "all" }),
      );

      expect(result.current.useLinksOptions).toEqual({
        status: "inbox",
      });
    });

    it("readStatusが'unread'の場合、isReadがfalseになる", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "all", readStatus: "unread" }),
      );

      expect(result.current.useLinksOptions).toEqual({
        isRead: false,
      });
    });

    it("readStatusが'read'の場合、isReadがtrueになる", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "all", readStatus: "read" }),
      );

      expect(result.current.useLinksOptions).toEqual({
        isRead: true,
      });
    });

    it("複数のフィルターを組み合わせて使用できる", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "read_soon", readStatus: "unread" }),
      );

      expect(result.current.useLinksOptions).toEqual({
        status: "read_soon",
        isRead: false,
      });
    });
  });

  describe("アクティブフィルター数", () => {
    it("フィルターが適用されていない場合は0", () => {
      const { result } = renderHook(() => useLinkListFilter());

      expect(result.current.activeFilterCount).toBe(0);
    });

    it("ステータスフィルターのみ適用されている場合は1", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "inbox", readStatus: "all" }),
      );

      expect(result.current.activeFilterCount).toBe(1);
    });

    it("既読状態フィルターのみ適用されている場合は1", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "all", readStatus: "unread" }),
      );

      expect(result.current.activeFilterCount).toBe(1);
    });

    it("両方のフィルターが適用されている場合は2", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "later", readStatus: "read" }),
      );

      expect(result.current.activeFilterCount).toBe(2);
    });
  });

  describe("フィルター適用状態", () => {
    it("フィルターが適用されていない場合はfalse", () => {
      const { result } = renderHook(() => useLinkListFilter());

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("いずれかのフィルターが適用されている場合はtrue", () => {
      const { result } = renderHook(() =>
        useLinkListFilter({ status: "inbox", readStatus: "all" }),
      );

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });
});
