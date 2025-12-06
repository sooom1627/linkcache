import React from "react";

import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { useCheckUserId } from "../../hooks/useCheckUserId";
import { useProfile } from "../../hooks/useProfile";
import { useProfileForm } from "../../hooks/useProfileForm";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { ProfileEditModal } from "../../screens/ProfileEditModal";
import { customRender } from "../test-utils.test";

// Mock ScrollableBottomSheetModal to render content immediately without bottom sheet logic
jest.mock("@/src/shared/components/modals", () => ({
  ScrollableBottomSheetModal: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mocks
jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock("../../hooks/useProfile", () => ({
  useProfile: jest.fn(),
}));

jest.mock("../../hooks/useCheckUserId", () => ({
  useCheckUserId: jest.fn(),
}));

jest.mock("../../hooks/useUpdateProfile", () => ({
  useUpdateProfile: jest.fn(),
}));

jest.mock("../../hooks/useProfileForm", () => ({
  useProfileForm: jest.fn(),
}));

describe("ProfileEditFlow", () => {
  const mockOnClose = jest.fn();
  const mockUpdateProfile = jest.fn();

  // Default valid form state
  const defaultFormState = {
    formData: { user_id: "testuser", username: "Test User" },
    errors: {},
    setUserId: jest.fn(),
    setUsername: jest.fn(),
    setFormData: jest.fn(),
    validateForm: jest.fn(() => true),
    hasErrors: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default hook returns
    jest.mocked(useProfile).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      data: { user_id: "original_id", username: "Original Name" } as any, // Partial mock
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    jest.mocked(useCheckUserId).mockReturnValue({
      data: true, // Available
      isLoading: false,
      error: null,
      isSuccess: true,
      status: "success",
      fetchStatus: "idle",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    jest.mocked(useUpdateProfile).mockReturnValue({
      data: undefined,
      mutateAsync: mockUpdateProfile,
      isPending: false,
      isError: false,
      error: null,
      reset: jest.fn(),
      status: "idle",
      submittedAt: 0,
      variables: undefined,
      mutate: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      isPaused: false,
      isSuccess: false,
    });

    jest.mocked(useProfileForm).mockReturnValue(defaultFormState);
  });

  it("renders correctly with initial data", () => {
    customRender(<ProfileEditModal onClose={mockOnClose} />);

    expect(
      screen.getByText("users.setting_modal.profile_edit.title"),
    ).toBeTruthy();
    expect(screen.getByDisplayValue("testuser")).toBeTruthy();
    expect(screen.getByDisplayValue("Test User")).toBeTruthy();
  });

  it("disables submit button when no changes", () => {
    // Mock profile same as form data
    jest.mocked(useProfile).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      data: { user_id: "testuser", username: "Test User" } as any,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    customRender(<ProfileEditModal onClose={mockOnClose} />);

    // @ts-ignore - toBeDisabled is available in test environment
    expect(
      screen.getByText("users.setting_modal.profile_edit.no_changes"),
    ).toBeDisabled();
  });

  it("shows error when user_id is taken", () => {
    // Form data changed
    jest.mocked(useProfileForm).mockReturnValue({
      ...defaultFormState,
      formData: { user_id: "taken_id", username: "Test User" },
    });

    // Check user id returns false (taken)
    jest.mocked(useCheckUserId).mockReturnValue({
      data: false,
      isLoading: false,
      error: null,
      isSuccess: true,
      status: "success",
      fetchStatus: "idle",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    customRender(<ProfileEditModal onClose={mockOnClose} />);

    expect(
      screen.getByText(
        "users.setting_modal.profile_edit.form_validation_messages.already_taken",
      ),
    ).toBeTruthy();

    // Button should be disabled (logic inside component checks this)
    // Note: Since we mocked useProfileForm, we need to ensure the component logic
    // uses the mocked return values to determine button state.
    // The component logic for disabled state:
    // !submitEnabled || isUnchanged
    // submitEnabled uses isUserIdAvailable which comes from useCheckUserId mock.
  });

  it("calls updateProfile when submit button is pressed", async () => {
    // Form data changed and valid
    jest.mocked(useProfileForm).mockReturnValue({
      ...defaultFormState,
      formData: { user_id: "new_id", username: "New Name" },
      validateForm: jest.fn(() => true),
    });

    jest.mocked(useProfile).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      data: { user_id: "old_id", username: "Old Name" } as any,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    customRender(<ProfileEditModal onClose={mockOnClose} />);

    fireEvent.press(
      screen.getByText("users.setting_modal.profile_edit.update_profile"),
    );

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        { user_id: "new_id", username: "New Name" },
        expect.anything(),
      );
    });
  });
});
