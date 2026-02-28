import { supabase } from "@/src/shared/lib/supabase";

import { deleteLinkById } from "../../api/deleteLink.api";

jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockRpc = jest.mocked(supabase.rpc);

const MOCK_LINK_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("deleteLinkById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls supabase.rpc with delete_user_link and correct link_id", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: null,
    } as never);

    await deleteLinkById(MOCK_LINK_ID);

    expect(mockRpc).toHaveBeenCalledWith("delete_user_link", {
      p_link_id: MOCK_LINK_ID,
    });
  });

  it("throws error when Supabase returns an error", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "RPC error", code: "PGRST116" },
    } as never);

    await expect(deleteLinkById(MOCK_LINK_ID)).rejects.toThrow(
      "Failed to delete link: RPC error",
    );
  });

  it("handles successful deletion", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: null,
    } as never);

    await expect(deleteLinkById(MOCK_LINK_ID)).resolves.toBeUndefined();
  });
});
