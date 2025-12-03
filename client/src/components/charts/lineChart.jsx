// ChartLine.jsx
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import { Box, Heading } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";

export default function ChartLine({ title, data, xKey, dataKey }) {
  const height = useBreakpointValue({ base: 200, md: 260 });
  const fontSize = useBreakpointValue({ base: 10, md: 12 });
  const strokeWidth = useBreakpointValue({ base: 2, md: 3 });

  return (
    <>
      {title && <Heading size="md" mb={4}>{title}</Heading>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize }} />
          <YAxis tick={{ fontSize }} />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke="#2F855A" strokeWidth={strokeWidth} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}