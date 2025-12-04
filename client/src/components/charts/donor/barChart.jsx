import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

export default function BarChartImpact({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Monthly CO₂ Impact (kg)" loading={loading}>
      {empty ? (
        <ChartEmpty message="CO₂ impact will appear once items are distributed." />
      ) : (
        <Box w="100%" minH="300px" h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="co2Bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#27ae60" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#2ecc71" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis
                dataKey="month"
                tick={{ fill: "#555", fontSize: 12 }}
                tickMargin={10}
              />

              <YAxis
                tick={{ fill: "#555", fontSize: 12 }}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(v) => [`${v} kg`, "CO₂ Saved"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              />

              <Bar
                dataKey="total_co2"
                fill="url(#co2Bar)"
                barSize={50}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  );
}