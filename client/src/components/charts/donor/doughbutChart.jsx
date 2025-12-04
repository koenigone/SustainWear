import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

const COLORS = ["#2ecc71", "#f1c40f", "#e74c3c"]; // accepted / pending / declined

export default function DoughnutChartStatus({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Donation Status Breakdown" loading={loading}>
      {empty ? (
        <ChartEmpty message="No donation activity yet." />
      ) : (
        <Box
          w="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <PieChart width={320} height={280}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={55}
              nameKey="status" // label for legend
              dataKey="count" // numeric value
              label
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip formatter={(value) => `${value} donations`} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) =>
                value.charAt(0).toUpperCase() + value.slice(1)
              }
            />
          </PieChart>
        </Box>
      )}
    </ChartCard>
  );
}