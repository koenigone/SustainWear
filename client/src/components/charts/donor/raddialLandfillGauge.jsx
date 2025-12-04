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

  if (loading)
    return <ChartCard title="Landfill Impact Gauge" loading={true} />;

  if (empty) {
    return (
      <ChartCard title="Landfill Impact Gauge">
        <ChartEmpty message="Your landfill impact will appear after donations are distributed." />
      </ChartCard>
    );
  }

  // aggregate landfill savings
  const totalLandfill = data.reduce(
    (sum, record) => sum + Number(record.total_landfill || 0),
    0
  );

  // define a scale
  const maxGoal = 50;
  const percentage = Math.min((totalLandfill / maxGoal) * 100, 100);

  const chartData = [
    {
      name: "Landfill Saved",
      value: percentage,
      fill: "#3498db",
    },
  ];

  return (
    <ChartCard title="Landfill Impact Gauge">
      <Box
        w="100%"
        minH="260px"
        h="260px"
        display="flex"
        flexDir="column"
        alignItems="center"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={18}
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              minAngle={15}
              background
              dataKey="value"
              cornerRadius={8}
            />
            <Tooltip
              formatter={(value) => [`${value.toFixed(1)}%`, "Progress"]}
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #eee",
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <Text fontWeight="700" fontSize="lg" color="brand.green" mt={-4}>
          {percentage.toFixed(1)}%
        </Text>
        <Text fontSize="sm" color="gray.500">
          of estimated landfill prevention goal
        </Text>
      </Box>
    </ChartCard>
  );
}