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

export default function OrgCategoryChart({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Accepted Donations by Category" loading={loading}>
      {empty ? (
        <ChartEmpty message="No accepted donations yet." />
      ) : (
        <Box w="100%" minH="300px" h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="categoryBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3498db" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#2980b9" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="category"
                tick={{ fill: "#555", fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#555", fontSize: 12 }}
              />

              <Tooltip
                formatter={(v) => [`${v} items`, "Count"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              />

              <Bar
                dataKey="count"
                fill="url(#categoryBar)"
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