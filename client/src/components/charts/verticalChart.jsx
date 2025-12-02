// VerticalChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { Box, Heading } from "@chakra-ui/react";

export default function VerticalChart({ title, data, categoryKey, dataKey }) {
  return (
    <>
      {title && <Heading size="md" mb={4}>{title}</Heading>}

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis dataKey={categoryKey} type="category" width={150} />
          <XAxis type="number" />
          <Tooltip />
          <Bar dataKey={dataKey} fill="#2B6CB0" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}