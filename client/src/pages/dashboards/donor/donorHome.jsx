import {
  Box,
  SimpleGrid,
  Heading,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../../../api/axiosClient";
import { useAuth } from "../../../auth/authContext";

import ChartLine from "../../../components/charts/lineChart";
import ChartPie from "../../../components/charts/pieChart";
import ChartDoughnut from "../../../components/charts/doughnutChart";
import VerticalChart from "../../../components/charts/verticalChart";

import { buildDonorDashboardMetrics } from "../../../components/metrics/donorMetrics";

export default function DonorHome() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    if (!user?.user_id) return;

    api
      .get(`/donor/${user.user_id}/metrics`)
      .then((res) => setMetrics(buildDonorDashboardMetrics(res.data)))
      .catch((err) => console.error("Metrics error:", err))
      .finally(() => setLoading(false));
  }, [user?.user_id]);

  if (loading)
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" color="green.500" />
      </Box>
    );

  if (!metrics) return null;

  const { kpis, charts } = metrics;

  return (
    <Box p={8}>
      {/* KPI CARDS */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={10}>
        <StatCard label="Total Donations" value={kpis.total_donations} />
        <StatCard label="Items Distributed" value={kpis.total_distributed} />
        <StatCard label="CO₂ Saved (kg)" value={kpis.co2_saved.toFixed(1)} />
        <StatCard label="People Helped" value={kpis.beneficiaries} />
      </SimpleGrid>

      {/* CHARTS */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <ChartCard title="CO₂ Saved Over Time">
          <ChartLine data={charts.co2_over_time} dataKey="value" xKey="label" />
        </ChartCard>

        <ChartCard title="Category Breakdown">
          <ChartPie
            data={charts.category_breakdown}
            dataKey="value"
            nameKey="label"
          />
        </ChartCard>

        <ChartCard title="Donation Status Breakdown">
          <ChartDoughnut data={charts.status_breakdown} dataKey="value" />
        </ChartCard>

        <ChartCard title="Monthly Distribution Activity">
          <VerticalChart
            data={charts.monthly_distribution}
            dataKey="value"
            categoryKey="label"
          />
        </ChartCard>
      </SimpleGrid>
    </Box>
  );
}

// reusable UI components
function StatCard({ label, value }) {
  const cardBg = useColorModeValue("white", "gray.800");
  return (
    <Box
      p={5}
      borderRadius="lg"
      bg={cardBg}
      boxShadow="lg"
      textAlign="center"
      transition="0.2s"
      _hover={{ transform: "translateY(-3px)", boxShadow: "xl" }}
    >
      <Stat>
        <StatLabel fontSize="sm" color="gray.500">
          {label}
        </StatLabel>
        <StatNumber fontSize="2xl" color="green.600">
          {value}
        </StatNumber>
      </Stat>
    </Box>
  );
}

function ChartCard({ title, children }) {
  const cardBg = useColorModeValue("white", "gray.800");
  return (
    <Box
      p={5}
      borderRadius="lg"
      bg={cardBg}
      boxShadow="md"
      transition="0.2s"
      _hover={{ boxShadow: "lg" }}
    >
      <Heading size="md" mb={4} color="green.700">
        {title}
      </Heading>
      <Box minH="260px">{children}</Box>
    </Box>
  );
}