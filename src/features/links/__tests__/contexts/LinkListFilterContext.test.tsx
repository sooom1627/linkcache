import { act, renderHook } from "@testing-library/react-native";

import {
  LinkListFilterProvider,
  useLinkListFilterContext,
} from "../../contexts/LinkListFilterContext";

describe("LinkListFilterContext", () => {
  describe("useLinkListFilterContext", () => {
    it("Provider内で正しくコンテキストを取得できる", () => {
      const { result } = renderHook(() => useLinkListFilterContext(), {
        wrapper: LinkListFilterProvider,
      });

      expect(result.current.filterState).toEqual({
        status: "all",
        readStatus: "all",
      });
    });

    it("Provider外で使用するとエラーをスローする", () => {
      // エラーをキャッチするためにconsole.errorを抑制
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useLinkListFilterContext());
      }).toThrow(
        "useLinkListFilterContext must be used within a LinkListFilterProvider",
      );

      consoleSpy.mockRestore();
    });

    it("ステータスフィルターを更新できる", () => {
      const { result } = renderHook(() => useLinkListFilterContext(), {
        wrapper: LinkListFilterProvider,
      });

      act(() => {
        result.current.setStatus("new");
      });

      expect(result.current.filterState.status).toBe("new");
    });

    it("既読状態フィルターを更新できる", () => {
      const { result } = renderHook(() => useLinkListFilterContext(), {
        wrapper: LinkListFilterProvider,
      });

      act(() => {
        result.current.setReadStatus("unread");
      });

      expect(result.current.filterState.readStatus).toBe("unread");
    });

    it("フィルターをリセットできる", () => {
      const { result } = renderHook(() => useLinkListFilterContext(), {
        wrapper: LinkListFilterProvider,
      });

      act(() => {
        result.current.setStatus("stock");
        result.current.setReadStatus("read");
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filterState).toEqual({
        status: "all",
        readStatus: "all",
      });
    });

    it("useLinksOptionsが正しく変換される", () => {
      const { result } = renderHook(() => useLinkListFilterContext(), {
        wrapper: LinkListFilterProvider,
      });

      act(() => {
        result.current.setStatus("read_soon");
        result.current.setReadStatus("unread");
      });

      expect(result.current.useLinksOptions).toEqual({
        status: "read_soon",
        isRead: false,
      });
    });
  });
});
