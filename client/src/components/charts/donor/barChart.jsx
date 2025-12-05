import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

export default function BarChartImpact({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Monthly CO₂ Impact (kg)" loading={loading}>
      {empty ? (
        <ChartEmpty message="CO₂ impact will appear once donations are distributed." />
      ) : (
        <Box w="100%" minH="260px" h="100%">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="co2Bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#27ae60" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#2ecc71" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v} kg`, "CO₂ Saved"]} />
              <Bar
                dataKey="total_co2"
                fill="url(#co2Bar)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  );
}