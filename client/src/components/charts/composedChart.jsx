import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import { useBreakpointValue } from "@chakra-ui/react";

export default function ComposedChartComp({ data, dataKey }) {
  const height = useBreakpointValue({ base: 200, md: 260 });
  const fontSize = useBreakpointValue({ base: 10, md: 12 });
  const strokeWidth = useBreakpointValue({ base: 2, md: 3 });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize }} />
        <YAxis tick={{ fontSize }} />
        <Tooltip />

        <Bar dataKey={dataKey} fill="#9AE6B4" />
        <Line dataKey={dataKey} stroke="#2F855A" strokeWidth={strokeWidth} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}