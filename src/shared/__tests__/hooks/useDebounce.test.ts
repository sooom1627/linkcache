import { act, renderHook } from "@testing-library/react-native";

import { useDebounce } from "../../hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("should debounce value updates", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      },
    );

    // Update value
    rerender({ value: "updated", delay: 500 });

    // Value should not update yet
    expect(result.current).toBe("initial");

    // Fast forward time by 200ms (less than delay)
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe("initial");

    // Fast forward time by remaining 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("updated");
  });

  it("should reset timer on rapid updates", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      },
    );

    // Update 1
    rerender({ value: "update1", delay: 500 });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("initial");

    // Update 2 (before previous timer fired)
    rerender({ value: "update2", delay: 500 });

    // Should still be initial
    expect(result.current).toBe("initial");

    // Advance 300ms (total 600ms from start, but only 300ms from second update)
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Should still be initial because timer was reset
    expect(result.current).toBe("initial");

    // Advance another 200ms (total 500ms from second update)
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe("update2");
  });
});
