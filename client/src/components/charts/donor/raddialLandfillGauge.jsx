import {
  RadialBarChart,
  RadialBar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Text } from "@chakra-ui/react";
import ChartCard from "../chartCard";
import ChartEmpty from "../chartEmpty";

export default function RadialLandfillGauge({ data, loading }) {
  const empty = !data || data.length === 0;

  if (loading) return <ChartCard title="Landfill Impact Gauge" loading />;

  if (empty)
    return (
      <ChartCard title="Landfill Impact Gauge">
        <ChartEmpty message="No landfill impact yet." />
      </ChartCard>
    );

  const totalLandfill = data.reduce(
    (sum, row) => sum + Number(row.total_landfill || 0),
    0
  );

  const maxGoal = 50;
  const percent = Math.min((totalLandfill / maxGoal) * 100, 100);

  const chartData = [{ value: percent, fill: "#3498db" }];

  return (
    <ChartCard title="Landfill Impact Gauge">
      <Box width="100%" height="260px">
        <ResponsiveContainer width="100%" height={260}>
          <RadialBarChart
            data={chartData}
            innerRadius="70%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
          >
            <RadialBar dataKey="value" cornerRadius={10} />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </Box>

      <Text mt={-3} fontWeight="700" color="brand.green" fontSize="lg">
        {percent.toFixed(1)}%
      </Text>
      <Text fontSize="sm" color="gray.500">
        of landfill goal reached
      </Text>
    </ChartCard>
  );
}