import { act, renderHook } from "@testing-library/react-native";

import { useProfileForm } from "../../hooks/useProfileForm";

describe("useProfileForm", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => useProfileForm());

    expect(result.current.formData).toEqual({ user_id: "", username: "" });
    expect(result.current.errors).toEqual({});
  });

  it("initializes with provided values", () => {
    const initialData = { user_id: "testuser", username: "Test User" };
    const { result } = renderHook(() => useProfileForm(initialData));

    expect(result.current.formData).toEqual(initialData);
  });

  it("updates user_id", () => {
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      result.current.setUserId("newuser");
    });

    expect(result.current.formData.user_id).toBe("newuser");
  });

  it("updates username", () => {
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      result.current.setUsername("New User");
    });

    expect(result.current.formData.username).toBe("New User");
  });

  it("validates user_id (valid)", () => {
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      result.current.setUserId("valid_user");
    });

    // Wait for useEffect
    expect(result.current.errors.user_id).toBeUndefined();
  });

  it("validates user_id (invalid - too short)", () => {
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      result.current.setUserId("abc");
    });

    expect(result.current.errors.user_id).toBeDefined();
  });

  it("validates user_id (invalid - invalid chars)", () => {
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      result.current.setUserId("user@name");
    });

    expect(result.current.errors.user_id).toBeDefined();
  });

  it("validates username (valid)", () => {
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      result.current.setUsername("Valid Name");
    });

    expect(result.current.errors.username).toBeUndefined();
  });

  it("validates username (invalid - too short)", () => {
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      result.current.setUsername("abc");
    });

    expect(result.current.errors.username).toBeDefined();
  });

  it("validateForm returns true for valid data", () => {
    const { result } = renderHook(() =>
      useProfileForm({ user_id: "valid_id", username: "Valid Name" }),
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it("validateForm returns false for invalid data and sets errors", () => {
    const { result } = renderHook(() =>
      useProfileForm({ user_id: "abc", username: "" }),
    );

    let isValid = true;
    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.user_id).toBeDefined();
    expect(result.current.errors.username).toBeDefined();
  });
});
