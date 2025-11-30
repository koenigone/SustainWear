import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Text } from "@chakra-ui/react";

export default function OrgLandfillChart({ data }) {
  const chartData = [{ name: "Landfill Reduced", value: data.total_landfill_saved || 0 }];

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <Text fontWeight="bold" mb={3}>Landfill Reduced (kg)</Text>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#D69E2E" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}