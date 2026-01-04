import { act, renderHook, waitFor } from "@testing-library/react-native";

import { checkUserIdAvailability } from "../../api";
import { useCheckUserId } from "../../hooks/useCheckUserId";
import { wrapper } from "../test-utils";

jest.mock("../../api", () => ({
  checkUserIdAvailability: jest.fn(),
}));

describe("useCheckUserId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should not fetch when userId is too short", async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useCheckUserId("abc"), { wrapper });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isLoading).toBe(false);
    expect(checkUserIdAvailability).not.toHaveBeenCalled();
  });

  it("should fetch when userId is valid and debounce completes", async () => {
    jest.mocked(checkUserIdAvailability).mockResolvedValue(true);

    const { result } = renderHook(() => useCheckUserId("validUser"), {
      wrapper,
    });

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
    jest.useFakeTimers();
    const { result } = renderHook(() => useCheckUserId("validUser", false), {
      wrapper,
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isFetching).toBe(false);
    expect(checkUserIdAvailability).not.toHaveBeenCalled();
  });

  it("should debounce rapid changes", async () => {
    jest.useFakeTimers();
    jest.mocked(checkUserIdAvailability).mockResolvedValue(true);

    const { result, rerender } = renderHook(
      (props: { id: string }) => useCheckUserId(props.id),
      {
        initialProps: { id: "user1" },
        wrapper,
      },
    );

    // Rapid updates
    rerender({ id: "user2" });
    rerender({ id: "user3" });

    act(() => {
      jest.advanceTimersByTime(500);
      jest.runAllTimers();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 2000,
    });

    expect(checkUserIdAvailability).toHaveBeenCalledWith("user1", undefined);
    expect(checkUserIdAvailability).toHaveBeenCalledWith("user3", undefined);
    expect(checkUserIdAvailability).not.toHaveBeenCalledWith(
      "user2",
      undefined,
    );
  });
});
