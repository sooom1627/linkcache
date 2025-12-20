import { waitFor } from "@testing-library/react-native";

import { createLink } from "../../api/createLink.api";
import { useCreateLink } from "../../hooks/useCreateLink";
import type { LinkMetadata } from "../../utils/metadata";
import { fetchLinkMetadata } from "../../utils/metadata";
import { customRenderHook } from "../test-utils";

// Mock SafeAreaContext (required for wrapper)
jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(
      ({ children }: { children: React.ReactNode }) => children,
    ),
    useSafeAreaInsets: jest.fn(() => inset),
  };
});

// Mock dependencies
jest.mock("../../utils/metadata", () => ({
  fetchLinkMetadata: jest.fn(),
}));

jest.mock("../../api/createLink.api", () => ({
  createLink: jest.fn(),
}));

describe("useCreateLink", () => {
  const mockUrl = "https://example.com";
  const mockMetadata: LinkMetadata = {
    title: "Example Title",
    description: "Example Description",
    image_url: "https://example.com/image.png",
    favicon_url: "https://example.com/favicon.ico",
    site_name: "Example Site",
  };
  const mockLinkResponse = {
    link_id: "link-123",
    url: mockUrl,
    status: "inbox",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully create a link (Happy Path)", async () => {
    // Setup mocks
    jest.mocked(fetchLinkMetadata).mockResolvedValue(mockMetadata);
    jest.mocked(createLink).mockResolvedValue(mockLinkResponse);

    const { result } = customRenderHook(() => useCreateLink());

    // Execute mutation
    let response;
    await waitFor(async () => {
      response = await result.current.mutateAsync(mockUrl);
    });

    // Verify interactions
    expect(fetchLinkMetadata).toHaveBeenCalledWith(mockUrl);
    expect(createLink).toHaveBeenCalledWith(mockUrl, mockMetadata);
    expect(response).toEqual(mockLinkResponse);
  });

  it("should handle metadata fetching error", async () => {
    const error = new Error("Metadata fetch failed");
    jest.mocked(fetchLinkMetadata).mockRejectedValue(error);

    const { result } = customRenderHook(() => useCreateLink());

    await expect(result.current.mutateAsync(mockUrl)).rejects.toThrow(
      "Metadata fetch failed",
    );

    expect(fetchLinkMetadata).toHaveBeenCalledWith(mockUrl);
    expect(createLink).not.toHaveBeenCalled();
  });

  it("should handle API creation error", async () => {
    const error = new Error("API failed");
    jest.mocked(fetchLinkMetadata).mockResolvedValue(mockMetadata);
    jest.mocked(createLink).mockRejectedValue(error);

    const { result } = customRenderHook(() => useCreateLink());

    await expect(result.current.mutateAsync(mockUrl)).rejects.toThrow(
      "API failed",
    );

    expect(fetchLinkMetadata).toHaveBeenCalledWith(mockUrl);
    expect(createLink).toHaveBeenCalledWith(mockUrl, mockMetadata);
  });
});
