import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createLinkWithStatus } from "../../api/createLink.api";
import { useCreateLink } from "../../hooks/useCreateLink";
import { fetchOgpMetadata } from "../../utils/metadata";
import { wrapper } from "../test-utils";

// API層のモック
jest.mock("../../api/createLink.api", () => ({
  createLinkWithStatus: jest.fn(),
}));

// メタデータ取得のモック
jest.mock("../../utils/metadata", () => ({
  fetchOgpMetadata: jest.fn(),
}));

describe("useCreateLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns mutation state", () => {
    const { result } = renderHook(() => useCreateLink(), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(typeof result.current.createLink).toBe("function");
  });

  it("fetches OGP metadata and creates link on mutation", async () => {
    const mockMetadata = {
      title: "Example Title",
      description: "Example Description",
      image_url: "https://example.com/image.jpg",
      favicon_url: "https://example.com/favicon.ico",
      site_name: "Example Site",
    };
    const mockResponse = {
      link_id: "test-uuid",
      url: "https://example.com",
      status: "inbox",
    };

    (fetchOgpMetadata as jest.Mock).mockResolvedValueOnce(mockMetadata);
    (createLinkWithStatus as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCreateLink(), { wrapper });

    act(() => {
      result.current.createLink("https://example.com");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchOgpMetadata).toHaveBeenCalledWith("https://example.com");
    expect(createLinkWithStatus).toHaveBeenCalledWith({
      url: "https://example.com",
      title: "Example Title",
      description: "Example Description",
      image_url: "https://example.com/image.jpg",
      favicon_url: "https://example.com/favicon.ico",
      site_name: "Example Site",
    });
  });

  it("creates link without metadata when OGP fetch fails", async () => {
    const mockResponse = {
      link_id: "test-uuid",
      url: "https://example.com",
      status: "inbox",
    };

    (fetchOgpMetadata as jest.Mock).mockResolvedValueOnce(null);
    (createLinkWithStatus as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCreateLink(), { wrapper });

    act(() => {
      result.current.createLink("https://example.com");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(createLinkWithStatus).toHaveBeenCalledWith({
      url: "https://example.com",
      title: null,
      description: null,
      image_url: null,
      favicon_url: null,
      site_name: null,
    });
  });

  it("sets error state when API call fails", async () => {
    const mockError = new Error("API Error");

    (fetchOgpMetadata as jest.Mock).mockResolvedValueOnce(null);
    (createLinkWithStatus as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCreateLink(), { wrapper });

    act(() => {
      result.current.createLink("https://example.com");
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
  });

  it("shows pending state during mutation", async () => {
    // 遅延させたPromiseでpending状態をテスト
    let resolveMetadata: (value: unknown) => void;
    const delayedMetadata = new Promise((resolve) => {
      resolveMetadata = resolve;
    });

    (fetchOgpMetadata as jest.Mock).mockReturnValueOnce(delayedMetadata);
    (createLinkWithStatus as jest.Mock).mockResolvedValueOnce({
      link_id: "test-uuid",
      url: "https://example.com",
      status: "inbox",
    });

    const { result } = renderHook(() => useCreateLink(), { wrapper });

    act(() => {
      result.current.createLink("https://example.com");
    });

    // mutationが開始されるのを待つ
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Promise解決
    await act(async () => {
      resolveMetadata!(null);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
