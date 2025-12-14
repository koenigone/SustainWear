const { getDateRange } = require("../../helpers/getReportRange");

describe("getDateRange", () => {
  test("returns valid 6M range", () => {
    const { start, end } = getDateRange("6M");

    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(start < end).toBe(true);
  });

  test("throws error for invalid range", () => {
    expect(() => getDateRange("INVALID")).toThrow("Invalid date range");
  });
});