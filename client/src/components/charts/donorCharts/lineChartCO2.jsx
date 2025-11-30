import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function LineChartComp({ data, dataKey }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke="#2F855A" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}