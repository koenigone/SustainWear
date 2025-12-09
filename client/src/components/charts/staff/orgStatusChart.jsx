import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

const COLORS = ["#2ecc71", "#f1c40f", "#e74c3c"]; // accepted / pending / declined

export default function OrgStatusChart({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Donation Status Overview" loading={loading}>
      {empty ? (
        <ChartEmpty message="No donation activity for this organisation yet." />
      ) : (
        <Box
          w="100%"
          minH="260px"
          h="260px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <PieChart width={320} height={240}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="count"
              nameKey="status"
              label
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} donations`, "Count"]}
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #eee",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) =>
                value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
              }
            />
          </PieChart>
        </Box>
      )}
    </ChartCard>
  );
}