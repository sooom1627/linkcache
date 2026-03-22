import { dashboardOverviewRpcSchema } from "@/src/features/links/api/fetchDashboardOverview.api";
import {
  dashboardOverviewDomainTotalsAlignedRpcFixture,
  dashboardOverviewValidRpcFixture,
  dashboardOverviewWithCollectionBreakdownRpcFixture,
  dashboardOverviewWithDomainBreakdownRpcFixture,
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

  it("dashboardOverviewDomainTotalsAlignedRpcFixture は Zod でパースできる", () => {
    const parsed = dashboardOverviewRpcSchema.safeParse(
      dashboardOverviewDomainTotalsAlignedRpcFixture,
    );
    expect(parsed.success).toBe(true);
  });

  it("dashboardOverviewWithDomainBreakdownRpcFixture は Zod でパースできる（daily_by_domain に __other__ と空 domain を含む）", () => {
    const parsed = dashboardOverviewRpcSchema.safeParse(
      dashboardOverviewWithDomainBreakdownRpcFixture,
    );
    expect(parsed.success).toBe(true);
  });
});
