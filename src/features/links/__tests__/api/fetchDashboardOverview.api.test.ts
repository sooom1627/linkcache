import { fetchDashboardOverview } from "../../api/fetchDashboardOverview.api";

const mockRpc = jest.fn();
const mockGetUser = jest.fn();

jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

const VALID_OVERVIEW = {
  daily_totals: [
    { date: "2025-03-16", added_count: 1, read_count: 0 },
    { date: "2025-03-17", added_count: 0, read_count: 2 },
    { date: "2025-03-18", added_count: 3, read_count: 1 },
    { date: "2025-03-19", added_count: 0, read_count: 0 },
    { date: "2025-03-20", added_count: 5, read_count: 4 },
    { date: "2025-03-21", added_count: 2, read_count: 2 },
    { date: "2025-03-22", added_count: 0, read_count: 1 },
  ],
  daily_by_collection: [],
  daily_by_domain: [],
};

describe("fetchDashboardOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls RPC with p_tz and returns parsed overview", async () => {
    mockRpc.mockResolvedValueOnce({
      data: VALID_OVERVIEW,
      error: null,
    });

    const result = await fetchDashboardOverview("Asia/Tokyo");

    expect(mockRpc).toHaveBeenCalledWith("get_dashboard_overview", {
      p_tz: "Asia/Tokyo",
    });
    expect(result).toEqual(VALID_OVERVIEW);
  });

  it("throws when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      "Not authenticated",
    );
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("throws when RPC returns an error", async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid timezone: empty" },
    });

    await expect(fetchDashboardOverview("")).rejects.toThrow(
      "Invalid timezone: empty",
    );
  });

  it("throws when RPC returns no data", async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    await expect(fetchDashboardOverview("Asia/Tokyo")).rejects.toThrow(
      "No data returned from RPC",
    );
  });

  it("throws when daily_totals length is not 7", async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        ...VALID_OVERVIEW,
        daily_totals: VALID_OVERVIEW.daily_totals.slice(0, 6),
      },
      error: null,
    });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_totals row has invalid date format", async () => {
    const bad = structuredClone(VALID_OVERVIEW);
    bad.daily_totals[0] = {
      date: "03/16/2025",
      added_count: 0,
      read_count: 0,
    };
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when counts are not non-negative integers", async () => {
    const bad = structuredClone(VALID_OVERVIEW);
    bad.daily_totals[0] = {
      date: "2025-03-16",
      added_count: -1,
      read_count: 0,
    };
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_collection is not an array", async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        ...VALID_OVERVIEW,
        daily_by_collection: {},
      },
      error: null,
    });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });
});
