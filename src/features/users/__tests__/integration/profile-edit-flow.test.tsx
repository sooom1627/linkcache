import React from "react";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import type { PostgrestError } from "@supabase/supabase-js";
import type { UseQueryResult } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useCheckUserId } from "../../hooks/useCheckUserId";
import { useProfile } from "../../hooks/useProfile";
import { useProfileForm } from "../../hooks/useProfileForm";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { ProfileEditModal } from "../../screens/ProfileEditModal";
import type { UserProfile } from "../../types";
import { customRender } from "../test-utils";

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

// Create a local query client for this test file
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

// Define wrapper locally to control queryClient
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <QueryClientProvider client={queryClient}>
      <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
    </QueryClientProvider>
  </GestureHandlerRootView>
);

// Helper to create a successful query result with proper typing
const createSuccessQueryResult = <T,>(
  data: T,
): UseQueryResult<T, PostgrestError> =>
  ({
    data,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    status: "success",
    fetchStatus: "idle",
    isPending: false,
    refetch: jest.fn(),
  }) as unknown as UseQueryResult<T, PostgrestError>;

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
    const mockProfile: UserProfile = {
      id: "1",
      user_id: "original_id",
      username: "Original Name",
      avatar_url: null,
    };
    jest
      .mocked(useProfile)
      .mockReturnValue(createSuccessQueryResult(mockProfile));

    jest.mocked(useCheckUserId).mockReturnValue(createSuccessQueryResult(true));

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

  afterEach(() => {
    queryClient.getQueryCache().clear();
    queryClient.getMutationCache().clear();
    jest.clearAllMocks();
  });

  it("renders correctly with initial data", () => {
    customRender(<ProfileEditModal onClose={mockOnClose} />, { wrapper });

    expect(
      screen.getByText("users.setting_modal.profile_edit.title"),
    ).toBeTruthy();
    expect(screen.getByDisplayValue("testuser")).toBeTruthy();
    expect(screen.getByDisplayValue("Test User")).toBeTruthy();
  });

  it("disables submit button when no changes", () => {
    // Mock profile same as form data
    const mockProfile: UserProfile = {
      id: "1",
      user_id: "testuser",
      username: "Test User",
      avatar_url: null,
    };
    jest
      .mocked(useProfile)
      .mockReturnValue(createSuccessQueryResult(mockProfile));

    customRender(<ProfileEditModal onClose={mockOnClose} />, { wrapper });

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
    jest
      .mocked(useCheckUserId)
      .mockReturnValue(createSuccessQueryResult(false));

    customRender(<ProfileEditModal onClose={mockOnClose} />, { wrapper });

    expect(
      screen.getByText(
        "users.setting_modal.profile_edit.form_validation_messages.already_taken",
      ),
    ).toBeTruthy();
  });

  it("calls updateProfile when submit button is pressed", async () => {
    // Form data changed and valid
    jest.mocked(useProfileForm).mockReturnValue({
      ...defaultFormState,
      formData: { user_id: "new_id", username: "New Name" },
      validateForm: jest.fn(() => true),
    });

    const mockProfile: UserProfile = {
      id: "1",
      user_id: "old_id",
      username: "Old Name",
      avatar_url: null,
    };
    jest
      .mocked(useProfile)
      .mockReturnValue(createSuccessQueryResult(mockProfile));

    customRender(<ProfileEditModal onClose={mockOnClose} />, { wrapper });

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
