import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

export default function OrgEnvironmentChart({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Environmental Impact Over Time" loading={loading}>
      {empty ? (
        <ChartEmpty message="Impact will appear after items are distributed." />
      ) : (
        <Box w="100%" minH="300px" h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="co2Area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#27ae60" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#2ecc71" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="landfillArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3498db" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#2980b9" stopOpacity={0.3} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#555", fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis tick={{ fill: "#555", fontSize: 12 }} />

              <Tooltip
                formatter={(value, key) => {
                  if (key === "total_co2") return [`${value} kg`, "CO₂ Saved"];
                  if (key === "total_landfill")
                    return [`${value} kg`, "Landfill Saved"];
                  return value;
                }}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              />

              <Area
                type="monotone"
                dataKey="total_co2"
                stackId="1"
                stroke="#27ae60"
                fill="url(#co2Area)"
              />
              <Area
                type="monotone"
                dataKey="total_landfill"
                stackId="1"
                stroke="#3498db"
                fill="url(#landfillArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  );
}