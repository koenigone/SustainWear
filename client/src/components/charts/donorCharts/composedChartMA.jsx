import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function ComposedChartComp({ data, dataKey }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill="#9AE6B4" />
        <Line dataKey={dataKey} stroke="#2F855A" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
