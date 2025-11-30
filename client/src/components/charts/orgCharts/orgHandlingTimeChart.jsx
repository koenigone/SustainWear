import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Text } from "@chakra-ui/react";

export default function OrgHandlingTimeChart({ data }) {
  const hours = Number(data?.avg_hours?.toFixed(2)) || 0;
  const chartData = [{ name: "Avg Hours", value: hours }];

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <Text fontWeight="bold" mb={3}>Average Handling Time (hours)</Text>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#805AD5" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}