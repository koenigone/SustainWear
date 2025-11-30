const CO2_VALUES = {
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
  "Other": 3.0,
};

const LANDFILL_PER_ITEM_KG = 0.8;

function calculateSustainabilityImpact(category) {
  const co2 = CO2_VALUES[category] || CO2_VALUES["Other"];
  const landfill = LANDFILL_PER_ITEM_KG;
  const beneficiaries = 1;

  return { co2, landfill, beneficiaries };
}

module.exports = { calculateSustainabilityImpact };