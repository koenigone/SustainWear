import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import { Box, Heading } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";

export default function ChartArea({ title, data, xKey, dataKey }) {
  const height = useBreakpointValue({ base: 200, md: 260 });
  const fontSize = useBreakpointValue({ base: 10, md: 12 });

  return (
    <>
      {title && <Heading size="md" mb={4}>{title}</Heading>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38A169" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#38A169" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize }} />
          <YAxis tick={{ fontSize }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey={dataKey}
            fill="url(#colorArea)"
            stroke="#2F855A"
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}