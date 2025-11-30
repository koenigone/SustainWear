import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ["#2F855A", "#68D391", "#22543D", "#9AE6B4", "#38A169"];

export default function PieChartComp({ data, dataKey }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip />
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey="category"
          outerRadius={100}
          fill="#2F855A"
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
