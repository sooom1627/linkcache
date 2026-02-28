import { renderHook } from "@testing-library/react-native";
import Toast from "react-native-toast-message";

import { convertFileToArrayBuffer } from "@/src/shared/utils/file";

import { uploadAvatar } from "../../api";
import { useUploadAvatar } from "../../hooks/useUploadAvatar";
import { wrapper } from "../test-utils";

// Mocks
jest.mock("../../api", () => ({
  uploadAvatar: jest.fn(),
}));

jest.mock("@/src/shared/utils/file", () => ({
  convertFileToArrayBuffer: jest.fn(),
  getExtensionFromMimeType: jest.fn(() => "jpg"),
}));

jest.mock("../../../auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

describe("useUploadAvatar", () => {
  beforeEach(() => {
    jest.spyOn(Toast, "show");
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should upload avatar successfully", async () => {
    const onSuccessMock = jest.fn();
    jest.mocked(convertFileToArrayBuffer).mockResolvedValue(new ArrayBuffer(8));
    jest.mocked(uploadAvatar).mockResolvedValue({
      avatarUrl: "https://example.com/avatar.jpg",
    });

    const { result } = renderHook(
      () => useUploadAvatar({ onSuccess: onSuccessMock }),
      { wrapper },
    );

    await result.current.mutateAsync({
      fileUri: "file:///test.jpg",
      mimeType: "image/jpeg",
    });

    expect(convertFileToArrayBuffer).toHaveBeenCalledWith("file:///test.jpg");
    expect(uploadAvatar).toHaveBeenCalledWith(
      "test-user-id",
      "test-user-id/avatar.jpg",
      expect.any(ArrayBuffer),
      "image/jpeg",
    );
    expect(onSuccessMock).toHaveBeenCalled();
    expect(Toast.show).toHaveBeenCalledWith({
      type: "success",
      text1: expect.any(String),
    });
  });

  it("should handle upload error", async () => {
    const onErrorMock = jest.fn();
    jest.mocked(convertFileToArrayBuffer).mockResolvedValue(new ArrayBuffer(8));
    jest.mocked(uploadAvatar).mockRejectedValue(new Error("Upload failed"));

    const { result } = renderHook(
      () => useUploadAvatar({ onError: onErrorMock }),
      { wrapper },
    );

    try {
      await result.current.mutateAsync({
        fileUri: "file:///test.jpg",
        mimeType: "image/jpeg",
      });
    } catch {
      // Expected error
    }

    expect(onErrorMock).toHaveBeenCalled();
    expect(Toast.show).toHaveBeenCalledWith({
      type: "error",
      text1: expect.any(String),
      text2: expect.stringContaining("avatar"),
    });
  });
});
