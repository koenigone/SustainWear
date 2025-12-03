import {
  formatMonthlySeries,
  formatStatusSeries,
} from "../../helpers/chartFormatter";

export function buildStaffDashboardMetrics(raw) {
  if (!raw) return null;

  const { kpis, charts } = raw;

  return {
    kpis: {
      pending: kpis.pending || 0,
      accepted: kpis.accepted || 0,
      distributed: kpis.distributed || 0,
      co2_saved: kpis.co2_saved || 0,
    },

    charts: {
      monthly_incoming: formatMonthlySeries(
        convertMonthlyRows(charts.monthly_incoming)
      ),

      category_breakdown: charts.category_breakdown.map((c) => ({
        label: c.category,
        value: c.total,
      })),

      processing_time: charts.processing_time.map((row) => ({
        label: row.staff_name,
        value: Number(row.avg_hours.toFixed(1)) || 0,
      })),

      distribution_impact: charts.distribution_impact.map((row) => ({
        label: row.month,
        value: Number(row.total_co2) || 0, // focuses on CO2 curve
      })),

      status_breakdown: formatStatusSeries(charts.status_breakdown),
    },
  };
}

// backend returns [{ month: "2025-11", total: 5 }]
function convertMonthlyRows(rows = []) {
  const obj = {};
  rows.forEach((r) => (obj[r.month] = r.total));
  return obj;
}