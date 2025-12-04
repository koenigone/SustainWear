import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

const COLORS = ["#1abc9c", "#3498db", "#9b59b6", "#e67e22", "#c0392b"];

export default function PieChartCategories({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Donation Categories" loading={loading}>
      {empty ? (
        <ChartEmpty message="No donation categories recorded yet." />
      ) : (
        <Box w="100%" display="flex" justifyContent="center" alignItems="center">
          <PieChart width={320} height={280}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={110}
              nameKey="category"   // show category names in the legend
              dataKey="count"      // numeric value for each slice
              label                // display labels on slice
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip formatter={(value, name) => [`${value} items`, "Items"]} />

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