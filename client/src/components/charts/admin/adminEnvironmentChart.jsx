import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

export default function AdminEnvironmentChart({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Environmental Impact Over Time" loading={loading}>
      {empty ? (
        <ChartEmpty message="Environmental impact will appear after distributions." />
      ) : (
        <Box w="100%" minH="300px" h="300px">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis dataKey="month" tick={{ fill: "#444" }} />
              <YAxis tick={{ fill: "#444" }} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="total_co2"
                stroke="#27ae60"
                strokeWidth={3}
                dot={{ r: 5 }}
                name="CO₂ Saved (kg)"
              />

              <Line
                type="monotone"
                dataKey="total_landfill"
                stroke="#3498db"
                strokeWidth={3}
                dot={{ r: 5 }}
                name="Landfill Saved (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  );
}