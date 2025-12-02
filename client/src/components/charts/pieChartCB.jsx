// ChartPie.jsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Heading } from "@chakra-ui/react";

const COLORS = ["#2F855A", "#68D391", "#22543D", "#9AE6B4", "#38A169"];

export default function ChartPie({ title, data, dataKey, nameKey }) {
  return (
    <>
      {title && <Heading size="md" mb={4}>{title}</Heading>}
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Tooltip />
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} outerRadius={100}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}