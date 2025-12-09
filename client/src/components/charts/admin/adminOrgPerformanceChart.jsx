import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

export default function AdminOrgPerformanceChart({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Top Performing Organisations" loading={loading}>
      {empty ? (
        <ChartEmpty message="No organisation performance data yet." />
      ) : (
        <Box w="100%" minH="300px" h="300px">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              layout="vertical"
              data={data.slice(0, 5)} // top 5 orgs
              margin={{ top: 10, right: 20, left: 50, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis type="number" tick={{ fill: "#555" }} />
              <YAxis
                type="category"
                dataKey="organisation_name"
                tick={{ fill: "#555" }}
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
                dataKey="distributed_items"
                fill="#2ecc71"
                barSize={30}
                radius={[8, 8, 8, 8]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  );
}