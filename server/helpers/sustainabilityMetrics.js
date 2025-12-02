// CATEGORY EMISSIONS
const CATEGORY_CO2 = {
  "T-shirt": 2.1,
  "Shirt": 2.1,
  "Hoodie": 6.5,
  "Jacket": 20.0,
  "Coat": 20.0,
  "Jeans": 13.0,
  "Trousers": 13.0,
  "Dress": 4.2,
  "Skirt": 4.2,
  "Shoes": 10.0,
};

const DEFAULT_CO2 = 3.0; // fallback for new categories

// LANDFILL IMPACT
const LANDFILL_KG_PER_ITEM = 0.8;

// BENEFICIARY MODEL
const BENEFICIARIES_PER_ITEM = 1;

// MAIN CALCULATOR
function calculateSustainabilityImpact(category, quantity = 1) {
  const baseCO2 = CATEGORY_CO2[category] || DEFAULT_CO2;

  const co2_saved = baseCO2 * quantity;
  const landfill_saved = LANDFILL_KG_PER_ITEM * quantity;
  const beneficiaries = BENEFICIARIES_PER_ITEM * quantity;

  return {
    co2_saved,
    landfill_saved,
    beneficiaries
  };
}

module.exports = { calculateSustainabilityImpact };