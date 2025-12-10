import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

const COLORS = ["#2ecc71", "#f1c40f", "#e74c3c"];

export default function DoughnutChartStatus({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Donation Status Breakdown" loading={loading}>
      {empty ? (
        <ChartEmpty message="No donation activity yet." />
      ) : (
        <Box w="100%" minH="260px">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                innerRadius="55%"
                outerRadius="80%"
                dataKey="count"
                nameKey="status"
                label
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
              <Legend verticalAlign="bottom" height={30} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  );
}