/**
 * monthly time-series
 * input: { "2025-11": 12.3 }
 * output: [ { label: "2025-11", value: 12.3 } ]
 */
export function formatMonthlySeries(obj = {}, valueKey = "value") {
  return Object.entries(obj).map(([label, value]) => ({
    label,
    value: Number(value) || 0,
  }));
}

/**
 * category breakdown
 * input: { "T-shirt": 3 }
 * output: [ { label: "T-shirt", value: 3 } ]
 */
export function formatCategorySeries(obj = {}) {
  return Object.entries(obj).map(([label, count]) => ({
    label,
    value: Number(count) || 0,
  }));
}

/**
 * status breakdown
 * input: [ { status: "Accepted", count: 5 } ]
 * output: [ { label: "Accepted", value: 5 } ]
 */
export function formatStatusSeries(rows = []) {
  return rows.map((r) => ({
    label: r.status,
    value: Number(r.count) || 0,
  }));
}
