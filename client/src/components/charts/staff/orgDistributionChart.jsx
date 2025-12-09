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

export default function OrgDistributionChart({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Items Distributed per Month" loading={loading}>
      {empty ? (
        <ChartEmpty message="No items have been distributed yet." />
      ) : (
        <Box w="100%" minH="300px" h="300px">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="distBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ecc71" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#27ae60" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#555", fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#555", fontSize: 12 }}
              />

              <Tooltip
                formatter={(v) => [`${v} items`, "Distributed"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              />

              <Bar
                dataKey="total_distributed"
                fill="url(#distBar)"
                barSize={40}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  );
}