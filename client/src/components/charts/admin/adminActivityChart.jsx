import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
        <ChartEmpty message="Platform activity will appear once donations begin." />
      ) : (
        <Box w="100%" minH="300px" h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis dataKey="month" tick={{ fill: "#555" }} />
              <YAxis tick={{ fill: "#555" }} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              />

              <Line
                type="monotone"
                dataKey="submitted"
                stroke="#3498db"
                strokeWidth={3}
                name="Submitted"
              />
              <Line
                type="monotone"
                dataKey="accepted"
                stroke="#2ecc71"
                strokeWidth={3}
                name="Accepted"
              />
              <Line
                type="monotone"
                dataKey="distributed"
                stroke="#9b59b6"
                strokeWidth={3}
                name="Distributed"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  );
}