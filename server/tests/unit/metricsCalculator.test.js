const {
  calculateSustainabilityImpact,
} = require("../../helpers/sustainabilityMetrics");

describe("calculateSustainabilityImpact", () => {
  test("calculates impact for known category", () => {
    const result = calculateSustainabilityImpact("Jacket", 2);

    expect(result).toEqual({
      co2_saved: 40,
      landfill_saved: 1.6,
      beneficiaries: 2,
    });
  });

  test("uses default CO2 for unknown category", () => {
    const result = calculateSustainabilityImpact("Unknown", 1);

    expect(result.co2_saved).toBe(3.0);
  });
});