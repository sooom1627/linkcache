import {
  fetchDashboardOverview,
  type DashboardOverviewRpcResult,
} from "../../api/fetchDashboardOverview.api";

const mockRpc = jest.fn();
const mockGetUser = jest.fn();

jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

const COLLECTION_ID_A = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const COLLECTION_ID_B = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

const VALID_OVERVIEW: DashboardOverviewRpcResult = {
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

const VALID_OVERVIEW_WITH_COLLECTION_ROWS: DashboardOverviewRpcResult = {
  ...VALID_OVERVIEW,
  daily_by_collection: [
    {
      date: "2025-03-20",
      collection_id: COLLECTION_ID_A,
      added_count: 2,
      read_count: 1,
    },
    {
      date: "2025-03-21",
      collection_id: COLLECTION_ID_B,
      added_count: 0,
      read_count: 3,
    },
  ],
};

const VALID_OVERVIEW_WITH_DOMAIN_ROWS: DashboardOverviewRpcResult = {
  ...VALID_OVERVIEW,
  daily_by_domain: [
    {
      date: "2025-03-20",
      domain: "example.com",
      added_count: 2,
      read_count: 1,
    },
    {
      date: "2025-03-21",
      domain: "__other__",
      added_count: 0,
      read_count: 3,
    },
    {
      date: "2025-03-22",
      domain: "",
      added_count: 1,
      read_count: 0,
    },
  ],
};

const VALID_OVERVIEW_WITH_COLLECTION_AND_DOMAIN_ROWS: DashboardOverviewRpcResult =
  {
    ...VALID_OVERVIEW_WITH_COLLECTION_ROWS,
    daily_by_domain: VALID_OVERVIEW_WITH_DOMAIN_ROWS.daily_by_domain,
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
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_totals = [
      {
        date: "03/16/2025",
        added_count: 0,
        read_count: 0,
      },
      ...VALID_OVERVIEW.daily_totals.slice(1),
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_totals row has a nonexistent calendar date", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_totals = [
      {
        date: "2025-02-31",
        added_count: 0,
        read_count: 0,
      },
      ...VALID_OVERVIEW.daily_totals.slice(1),
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when counts are not non-negative integers", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_totals = [
      {
        date: "2025-03-16",
        added_count: -1,
        read_count: 0,
      },
      ...VALID_OVERVIEW.daily_totals.slice(1),
    ];
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

  it("returns parsed overview when daily_by_collection has valid rows", async () => {
    mockRpc.mockResolvedValueOnce({
      data: VALID_OVERVIEW_WITH_COLLECTION_ROWS,
      error: null,
    });

    const result = await fetchDashboardOverview("Asia/Tokyo");

    expect(result).toEqual(VALID_OVERVIEW_WITH_COLLECTION_ROWS);
  });

  it("throws when daily_by_collection element is not an object", async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        ...VALID_OVERVIEW,
        daily_by_collection: ["not-a-row"],
      },
      error: null,
    });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_collection row has invalid date format", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_by_collection = [
      {
        date: "03/20/2025",
        collection_id: COLLECTION_ID_A,
        added_count: 1,
        read_count: 0,
      },
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_collection row has non-uuid collection_id", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_by_collection = [
      {
        date: "2025-03-20",
        collection_id: "not-a-uuid",
        added_count: 1,
        read_count: 0,
      },
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_collection row has negative count", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_by_collection = [
      {
        date: "2025-03-20",
        collection_id: COLLECTION_ID_A,
        added_count: -1,
        read_count: 0,
      },
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_collection row has non-integer count", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_by_collection = [
      {
        date: "2025-03-20",
        collection_id: COLLECTION_ID_A,
        added_count: 1.5,
        read_count: 0,
      },
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_collection row has unknown extra keys", async () => {
    const bad: Record<string, unknown> = {
      ...VALID_OVERVIEW,
      daily_by_collection: [
        {
          date: "2025-03-20",
          collection_id: COLLECTION_ID_A,
          added_count: 1,
          read_count: 0,
          extra_field: true,
        },
      ],
    };
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("returns parsed overview when daily_by_domain has valid rows", async () => {
    mockRpc.mockResolvedValueOnce({
      data: VALID_OVERVIEW_WITH_DOMAIN_ROWS,
      error: null,
    });

    const result = await fetchDashboardOverview("Asia/Tokyo");

    expect(result).toEqual(VALID_OVERVIEW_WITH_DOMAIN_ROWS);
  });

  it("returns parsed overview when daily_by_collection and daily_by_domain both have rows", async () => {
    mockRpc.mockResolvedValueOnce({
      data: VALID_OVERVIEW_WITH_COLLECTION_AND_DOMAIN_ROWS,
      error: null,
    });

    const result = await fetchDashboardOverview("UTC");

    expect(result).toEqual(VALID_OVERVIEW_WITH_COLLECTION_AND_DOMAIN_ROWS);
  });

  it("throws when daily_by_domain is not an array", async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        ...VALID_OVERVIEW,
        daily_by_domain: {},
      },
      error: null,
    });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_domain element is not an object", async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        ...VALID_OVERVIEW,
        daily_by_domain: ["not-a-row"],
      },
      error: null,
    });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_domain row has invalid date format", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_by_domain = [
      {
        date: "03/20/2025",
        domain: "example.com",
        added_count: 1,
        read_count: 0,
      },
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_domain row has nonexistent calendar date", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_by_domain = [
      {
        date: "2025-02-31",
        domain: "example.com",
        added_count: 1,
        read_count: 0,
      },
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_domain row has non-string domain", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_by_domain = [
      {
        date: "2025-03-20",
        domain: 123,
        added_count: 1,
        read_count: 0,
      },
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_domain row has negative count", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_by_domain = [
      {
        date: "2025-03-20",
        domain: "example.com",
        added_count: -1,
        read_count: 0,
      },
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_domain row has non-integer count", async () => {
    const bad = structuredClone(VALID_OVERVIEW) as Record<string, unknown>;
    bad.daily_by_domain = [
      {
        date: "2025-03-20",
        domain: "example.com",
        added_count: 1.5,
        read_count: 0,
      },
    ];
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });

  it("throws when daily_by_domain row has unknown extra keys", async () => {
    const bad: Record<string, unknown> = {
      ...VALID_OVERVIEW,
      daily_by_domain: [
        {
          date: "2025-03-20",
          domain: "example.com",
          added_count: 1,
          read_count: 0,
          extra_field: true,
        },
      ],
    };
    mockRpc.mockResolvedValueOnce({ data: bad, error: null });

    await expect(fetchDashboardOverview("UTC")).rejects.toThrow(
      /Validation failed:/,
    );
  });
});
