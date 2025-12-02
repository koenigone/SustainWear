import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import { Box, Heading } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";

export default function ChartBar({ title, data, xKey, dataKey, color = "#2F855A" }) {
  const height = useBreakpointValue({ base: 200, md: 260 });
  const fontSize = useBreakpointValue({ base: 10, md: 12 });

  return (
    <>
      {title && <Heading size="md" mb={4}>{title}</Heading>}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize }} />
          <YAxis tick={{ fontSize }} />
          <Tooltip />
          <Bar dataKey={dataKey} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}