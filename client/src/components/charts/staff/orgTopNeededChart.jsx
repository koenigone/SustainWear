import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";
import { Box } from "@chakra-ui/react";

export default function OrgNeededCategoriesChart({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Top Needed Categories" loading={loading}>
      {empty ? (
        <ChartEmpty message="No demand data yet." />
      ) : (
        <Box w="100%" minH="300px" h="300px">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis type="number" tick={{ fill: "#555" }} />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: "#555" }}
                width={100}
              />

              <Tooltip
                formatter={(value) => [`${value}`, "Gap"]}
                labelFormatter={(label) => `Category: ${label}`}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              />

              <Bar
                dataKey="gap"
                fill="#e74c3c"
                barSize={18}
                radius={[5, 5, 5, 5]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  );
}