import { readFileSync } from "fs";
import { join } from "path";

describe("get_user_links migration regression", () => {
  it("legacy overloadをdropするmigrationが存在する", () => {
    const migrationPath = join(
      process.cwd(),
      "supabase/migrations/20260308010000_drop_legacy_get_user_links_overload.sql",
    );
    const migration = readFileSync(migrationPath, "utf-8");

    expect(migration).toContain(
      "DROP FUNCTION IF EXISTS public.get_user_links(",
    );
    expect(migration).toContain("triage_status");
    expect(migration).toContain("uuid");
  });
});
