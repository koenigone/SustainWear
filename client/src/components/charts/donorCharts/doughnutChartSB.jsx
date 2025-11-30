import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";

const STATUS_COLORS = {
  Pending: "#D69E2E",
  Accepted: "#38A169",
  Declined: "#E53E3E",
  Cancelled: "#718096",
};

export default function DoughnutChartComp({ data, dataKey }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip />
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey="status"
          innerRadius={60}
          outerRadius={100}
        >
          {data.map((item, idx) => (
            <Cell key={idx} fill={STATUS_COLORS[item.status]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}