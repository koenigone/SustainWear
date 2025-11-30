import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Text } from "@chakra-ui/react";

export default function OrgCO2Chart({ data }) {
  const chartData = [{ name: "CO₂ Saved", value: data.total_co2_saved || 0 }];

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <Text fontWeight="bold" mb={3}>Total CO₂ Saved (kg)</Text>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area dataKey="value" stroke="#2B6CB0" fill="#90CDF4" />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}