import ChartCard from "../chartCard";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function UserGrowthChart({ data = [], loading }) {
  return (
    <ChartCard title="User Growth Over Time" loading={loading}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="new_users"
            stroke="#2F855A"
            strokeWidth={3}
            dot={{ r: 4, fill: "#2F855A" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}