import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function BarChartComp({ data, dataKey }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill="#2F855A" />
      </BarChart>
    </ResponsiveContainer>
  );
}
