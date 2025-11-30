import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Text } from "@chakra-ui/react";

const COLORS = ["#38A169", "#E53E3E", "#DD6B20", "#CBD5E0"];

export default function OrgStatusChart({ data }) {
  const chartData = [
    { name: "Accepted", value: data.accepted },
    { name: "Declined", value: data.declined },
    { name: "Cancelled", value: data.cancelled },
    { name: "Pending", value: data.pending },
  ];

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <Text fontWeight="bold" mb={3}>Donation Status Overview</Text>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}