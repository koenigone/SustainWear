import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function AreaChartComp({ data, dataKey }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38A169" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#38A169" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey={dataKey} stroke="#2F855A" fill="url(#colorArea)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}