import { renderHook, waitFor } from "@testing-library/react-native";

import { checkUserIdAvailability } from "../../api";
import { useCheckUserId } from "../../hooks/useCheckUserId";
import { wrapper } from "../test-utils";

// Mock api
jest.mock("../../api", () => ({
  checkUserIdAvailability: jest.fn(),
}));

// Mock useDebounce to return value immediately for testing, or we can use real timers
// Using real implementation with fake timers is better for testing logic

describe("useCheckUserId", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should not fetch when userId is too short", async () => {
    const { result } = renderHook(() => useCheckUserId("abc"), { wrapper });

    // Fast-forward timers
    jest.advanceTimersByTime(1000);

    expect(result.current.isLoading).toBe(false);
    expect(checkUserIdAvailability).not.toHaveBeenCalled();
  });

  it("should fetch when userId is valid and debounce completes", async () => {
    jest.mocked(checkUserIdAvailability).mockResolvedValue(true);

    const { result } = renderHook(() => useCheckUserId("validUser"), {
      wrapper,
    });

    // Initial state should be loading true (if strict loading) or pending
    // But since debounce hasn't fired, it might not be fetching yet
    // Actually react-query `enabled` depends on debounced value.
    // Initial debounced value is same as input? No, useDebounce initializes with value.
    // Let's check useDebounce implementation: const [debouncedValue, setDebouncedValue] = useState<T>(value);
    // So initial render has the value immediately.

    // Wait for query to fire?
    // Since enable is true immediately, it should fire.

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(checkUserIdAvailability).toHaveBeenCalledWith(
      "validUser",
      undefined,
    );
  });

  it("should pass excludeUserId to api", async () => {
    jest.mocked(checkUserIdAvailability).mockResolvedValue(true);

    const { result } = renderHook(
      () => useCheckUserId("validUser", true, "currentUser"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(checkUserIdAvailability).toHaveBeenCalledWith(
      "validUser",
      "currentUser",
    );
  });

  it("should respect enabled flag", async () => {
    const { result } = renderHook(() => useCheckUserId("validUser", false), {
      wrapper,
    });

    jest.advanceTimersByTime(1000);

    expect(result.current.isFetching).toBe(false);
    expect(checkUserIdAvailability).not.toHaveBeenCalled();
  });

  it("should debounce rapid changes", async () => {
    jest.mocked(checkUserIdAvailability).mockResolvedValue(true);

    const { result, rerender } = renderHook(
      (props: { id: string }) => useCheckUserId(props.id),
      {
        initialProps: { id: "user1" },
        wrapper,
      },
    );

    // Update to user2 immediately
    rerender({ id: "user2" });

    // Update to user3 immediately
    rerender({ id: "user3" });

    // Advance time
    jest.advanceTimersByTime(500);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should only have called for user1 (initial) and user3 (final)
    // Actually useDebounce initializes with value, so user1 is fired.
    // Then rapid updates happen. user2 is skipped. user3 is settled.

    // Note: useDebounce implementation:
    // const [debouncedValue, setDebouncedValue] = useState<T>(value);
    // useEffect(...)

    // 1. Initial render: debounced=user1. Query enabled. Fetch user1.
    // 2. Rerender user2: debounced=user1. Effect schedules user2 update in 500ms.
    // 3. Rerender user3: debounced=user1. Effect clears user2 timer, schedules user3 in 500ms.
    // 4. 500ms passes: debounced updates to user3. Query enabled. Fetch user3.

    expect(checkUserIdAvailability).toHaveBeenCalledWith("user1", undefined);
    expect(checkUserIdAvailability).toHaveBeenCalledWith("user3", undefined);
    expect(checkUserIdAvailability).not.toHaveBeenCalledWith(
      "user2",
      undefined,
    );
  });
});
