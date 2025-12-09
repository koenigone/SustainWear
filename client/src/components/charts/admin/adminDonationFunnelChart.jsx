import ChartCard from "../chartCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DonationFunnelChart({ data, loading }) {
  if (!data) data = {};

  const chartData = [
    { stage: "Submitted", value: data.submitted || 0 },
    { stage: "Reviewed", value: data.reviewed || 0 },
    { stage: "Accepted", value: data.accepted || 0 },
    { stage: "Distributed", value: data.distributed || 0 },
  ];

  return (
    <ChartCard title="Donation Funnel Overview" loading={loading}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" fill="#2B6CB0" radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}