import {
  formatMonthlySeries,
  formatCategorySeries,
  formatStatusSeries,
} from "../../helpers/chartFormatter";

export function buildDonorDashboardMetrics(raw) {
  if (!raw) return null;

  // KPI cards
  const kpis = {
    total_donations: raw.total_donations || 0,
    total_distributed: raw.total_distributed || 0,
    co2_saved: raw.sustainability?.co2_saved || 0,
    beneficiaries: raw.sustainability?.beneficiaries || 0,
  };

  // chat data normalized
  const charts = {
    co2_over_time: formatMonthlySeries(raw.co2_over_time, "value"),
    category_breakdown: formatCategorySeries(raw.category_breakdown),
    status_breakdown: formatStatusSeries(raw.status_breakdown),
    monthly_distribution: formatMonthlySeries(raw.monthly_trend, "value"),
  };

  return { kpis, charts };
}