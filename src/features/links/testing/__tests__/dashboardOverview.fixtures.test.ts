import { dashboardOverviewRpcSchema } from "@/src/features/links/api/fetchDashboardOverview.api";
import {
  dashboardOverviewValidRpcFixture,
  dashboardOverviewWithCollectionBreakdownRpcFixture,
} from "@/src/features/links/testing/dashboardOverview.fixtures";

jest.mock("@/src/shared/lib/supabase", () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    rpc: jest.fn(),
  },
}));

describe("dashboardOverview.fixtures (RPC contract)", () => {
  it("dashboardOverviewValidRpcFixture は Zod スキーマでパースできる", () => {
    const parsed = dashboardOverviewRpcSchema.safeParse(
      dashboardOverviewValidRpcFixture,
    );
    expect(parsed.success).toBe(true);
  });

  it("dashboardOverviewWithCollectionBreakdownRpcFixture は Zod でパースできる（daily_by_collection 含む）", () => {
    const parsed = dashboardOverviewRpcSchema.safeParse(
      dashboardOverviewWithCollectionBreakdownRpcFixture,
    );
    expect(parsed.success).toBe(true);
  });
});
