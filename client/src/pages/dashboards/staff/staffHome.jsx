import { useEffect, useState } from "react";
import { Box, Heading, SimpleGrid, Spinner } from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import { useAuth } from "../../../auth/authContext";

// reusable charts
import LineChartComp from "../../../components/charts/lineChartCO2";
import AreaChartComp from "../../../components/charts/areaChartLS";
import BarChartComp from "../../../components/charts/barChartBeneficiaries";
import DoughnutChartComp from "../../../components/charts/doughnutChartSB";
import ComposedChartComp from "../../../components/charts/composedChartMA";

export default function OrganisationHome() {
  const { organisation } = useAuth();
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [handling, setHandling] = useState(null);

  useEffect(() => {
    if (!organisation?.org_id) return;

    const loadMetrics = async () => {
      try {
        const [summaryRes, monthlyRes, catRes, handlingRes] = await Promise.all(
          [
            api.get(`/orgs/${organisation.org_id}/summary`),
            api.get(`/orgs/${organisation.org_id}/monthly-trend`),
            api.get(`/orgs/${organisation.org_id}/categories`),
            api.get(`/orgs/${organisation.org_id}/handling-time`),
          ]
        );

        setSummary(summaryRes.data);
        setMonthly(monthlyRes.data);
        setCategories(catRes.data);
        setHandling(handlingRes.data);
      } catch (err) {
        console.error("Failed loading org metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [organisation]);

  if (loading) return <Spinner size="xl" mt={10} />;
  if (!summary) return null;

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Monthly donation trend */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>
            Monthly Donation Trend
          </Heading>
          <LineChartComp data={monthly} xKey="month" dataKey="total" />
        </Box>

        {/* Category breakdown */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>
            Category Breakdown
          </Heading>
          <BarChartComp data={categories} xKey="category" dataKey="total" />
        </Box>

        {/* Status breakdown */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>
            Donation Status Overview
          </Heading>
          <DoughnutChartComp
            data={[
              { status: "Accepted", total: summary.accepted },
              { status: "Declined", total: summary.declined },
              { status: "Pending", total: summary.pending },
              { status: "Cancelled", total: summary.cancelled },
            ]}
            dataKey="total"
          />
        </Box>

        {/* CO₂ saved */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>
            CO₂ Saved (kg)
          </Heading>
          <AreaChartComp
            data={[{ date: "Total", value: summary.total_co2_saved }]}
            xKey="date"
            dataKey="value"
          />
        </Box>

        {/* Landfill saved */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>
            Landfill Weight Saved (kg)
          </Heading>
          <AreaChartComp
            data={[{ date: "Total", value: summary.total_landfill_saved }]}
            xKey="date"
            dataKey="value"
          />
        </Box>

        {/* Avg Handling Time */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>
            Avg Handling Time (Days)
          </Heading>
          <ComposedChartComp
            data={[{ month: "Avg", total: handling?.avg_hours ?? 0 }]}
            dataKey="total"
          />
        </Box>
      </SimpleGrid>
    </Box>
  );
}