import { isValidAddedReadDayStatsPair } from "@/src/features/links/utils/dashboardWeek";

const seven = () => Array.from({ length: 7 }, () => []);

describe("isValidAddedReadDayStatsPair", () => {
  it("returns true when both arrays have length 7", () => {
    const a = seven();
    const b = seven();
    expect(isValidAddedReadDayStatsPair(a, b)).toBe(true);
  });

  it("returns false when either array is not an array", () => {
    expect(isValidAddedReadDayStatsPair(null, seven())).toBe(false);
    expect(isValidAddedReadDayStatsPair(seven(), undefined)).toBe(false);
  });

  it("returns false when either array length is not 7", () => {
    expect(isValidAddedReadDayStatsPair([[], [], []], seven())).toBe(false);
    expect(isValidAddedReadDayStatsPair(seven(), [[], [], []])).toBe(false);
  });
});
