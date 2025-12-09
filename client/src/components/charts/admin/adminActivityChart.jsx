import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

export default function AdminActivityChart({ data, loading }) {
  const empty = !data || data.length === 0;

  return (
    <ChartCard title="Monthly Platform Activity" loading={loading}>
      {empty ? (
        <ChartEmpty message="Activity will appear once donations begin." />
      ) : (
        <Box w="100%" minH="300px" h="300px">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis dataKey="month" tick={{ fill: "#444" }} />
              <YAxis tick={{ fill: "#444" }} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              />

              <Legend />

              <Bar dataKey="submitted" fill="#3498db" name="Submitted" />
              <Bar dataKey="accepted" fill="#2ecc71" name="Accepted" />
              <Bar dataKey="distributed" fill="#9b59b6" name="Distributed" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  );
}