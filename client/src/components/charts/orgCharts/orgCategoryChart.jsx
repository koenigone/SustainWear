import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Text } from "@chakra-ui/react";

const COLORS = ["#3182CE", "#2F855A", "#D69E2E", "#DD6B20", "#805AD5"];

export default function OrgCategoryChart({ data }) {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <Text fontWeight="bold" mb={3}>Donation Categories</Text>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie dataKey="total" data={data} cx="50%" cy="50%" outerRadius={90}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}