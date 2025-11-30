import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Box, Text } from "@chakra-ui/react";

export default function OrgMonthlyTrendChart({ data }) {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <Text fontWeight="bold" mb={3}>Monthly Donations Trend</Text>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#2F855A" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}