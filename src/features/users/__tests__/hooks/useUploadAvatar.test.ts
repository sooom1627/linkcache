import { Alert } from "react-native";

import { renderHook } from "@testing-library/react-native";

import { convertFileToArrayBuffer } from "@/src/shared/utils/file";

import { uploadAvatar } from "../../api";
import { useUploadAvatar } from "../../hooks/useUploadAvatar";
import { wrapper } from "../test-utils.test";

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

// Spy on Alert
jest.spyOn(Alert, "alert");

describe("useUploadAvatar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should upload avatar successfully", async () => {
    const onSuccessMock = jest.fn();
    (convertFileToArrayBuffer as jest.Mock).mockResolvedValue(
      new ArrayBuffer(8),
    );
    (uploadAvatar as jest.Mock).mockResolvedValue({ path: "avatar.jpg" });

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
    expect(Alert.alert).toHaveBeenCalledWith(
      "Success",
      "Avatar uploaded successfully",
    );
  });

  it("should handle upload error", async () => {
    const onErrorMock = jest.fn();
    (convertFileToArrayBuffer as jest.Mock).mockResolvedValue(
      new ArrayBuffer(8),
    );
    (uploadAvatar as jest.Mock).mockRejectedValue(new Error("Upload failed"));

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
    expect(Alert.alert).toHaveBeenCalledWith(
      "Upload Failed",
      expect.stringContaining("Could not upload avatar"),
    );
  });
});
