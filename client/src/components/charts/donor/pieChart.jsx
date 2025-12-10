import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

const COLORS = ["#1abc9c", "#3498db", "#9b59b6", "#e67e22", "#c0392b"];

export default function PieChartCategories({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Donation Categories" loading={loading}>
      {empty ? (
        <ChartEmpty message="No donation categories yet." />
      ) : (
        <Box width="100%" height="260px">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                outerRadius="80%"
                dataKey="count"
                nameKey="category"
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