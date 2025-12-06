import { act, renderHook } from "@testing-library/react-native";

import {
  useFormattedMonthDay,
  useFormattedTime,
} from "../../hooks/useDateTime";
import * as timezoneUtils from "../../utils/timezone";

// Mock timezone utils to control output and avoid dependency on actual time formatting
jest.mock("../../utils/timezone", () => ({
  formatTime: jest.fn(),
  formatMonthDay: jest.fn(),
}));

describe("useDateTime hooks", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("useFormattedTime", () => {
    it("should return formatted time and update every minute", () => {
      // Setup mock return values
      jest.mocked(timezoneUtils.formatTime).mockReturnValue("10:00");

      const { result } = renderHook(() => useFormattedTime("short"));

      // Initial render
      expect(result.current).toBe("10:00");
      expect(timezoneUtils.formatTime).toHaveBeenCalledTimes(1);

      // Change mock for update
      jest.mocked(timezoneUtils.formatTime).mockReturnValue("10:01");

      // Fast-forward 1 minute
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(result.current).toBe("10:01");
      expect(timezoneUtils.formatTime).toHaveBeenCalledTimes(2);
    });

    it("should clean up interval on unmount", () => {
      const { unmount } = renderHook(() => useFormattedTime());

      unmount();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Should not have called formatTime again (only initial call)
      expect(timezoneUtils.formatTime).toHaveBeenCalledTimes(1);
    });
  });

  describe("useFormattedMonthDay", () => {
    it("should return formatted month/day and update every 10 minutes", () => {
      // Setup mock return values
      jest.mocked(timezoneUtils.formatMonthDay).mockReturnValue("Oct 27");

      const { result } = renderHook(() => useFormattedMonthDay());

      // Initial render: called once in useState (not lazy) and once in useEffect = 2 times
      expect(result.current).toBe("Oct 27");
      expect(timezoneUtils.formatMonthDay).toHaveBeenCalledTimes(2);

      // Change mock for update
      jest.mocked(timezoneUtils.formatMonthDay).mockReturnValue("Oct 28");

      // Fast-forward 10 minutes
      act(() => {
        jest.advanceTimersByTime(600000);
      });

      expect(result.current).toBe("Oct 28");
      // +1 call from interval + 1 call from re-render (useState arg evaluation) = 4
      expect(timezoneUtils.formatMonthDay).toHaveBeenCalledTimes(4);
    });
  });
});
