import {
  Box,
  Grid,
  GridItem,
  Heading,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../../../api/axiosClient";
import { useAuth } from "../../../auth/authContext";

// donor charts
import LineChartComp from "../../../components/charts/donorCharts/lineChartCO2";
import AreaChartComp from "../../../components/charts/donorCharts/areaChartLS";
import BarChartComp from "../../../components/charts/donorCharts/barChartBeneficiaries";
import PieChartComp from "../../../components/charts/donorCharts/pieChartCB";
import DoughnutChartComp from "../../../components/charts/donorCharts/doughnutChartSB";
import ComposedChartComp from "../../../components/charts/donorCharts/composedChartMA";

export default function DonorHome() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    api
      .get(`/donor/${user.user_id}/metrics`)
      .then((res) => setMetrics(res.data))
      .catch((err) => console.error("Metrics error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" color="green.500" />
      </Box>
    );

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} color="green.700">
        Your Sustainability Dashboard 🌱
      </Heading>

      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* CO2 saved */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              CO₂ Saved Over Time
            </Heading>
            <LineChartComp data={metrics.co2OverTime} dataKey="total_co2" />
          </Box>
        </GridItem>

        {/* landfill saved */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              Landfill Weight Saved (kg)
            </Heading>
            <AreaChartComp
              data={metrics.landfillOverTime}
              dataKey="total_landfill"
            />
          </Box>
        </GridItem>

        {/* beneficiaries */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              People Benefited Over Time
            </Heading>
            <BarChartComp
              data={metrics.beneficiariesOverTime}
              dataKey="total_beneficiaries"
            />
          </Box>
        </GridItem>

        {/* category breakdown */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              Donation Categories
            </Heading>
            <PieChartComp data={metrics.categoryBreakdown} dataKey="total" />
          </Box>
        </GridItem>

        {/* status breakdown */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              Donation Status Overview
            </Heading>
            <DoughnutChartComp data={metrics.statusBreakdown} dataKey="total" />
          </Box>
        </GridItem>

        {/* monthly activity */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              Monthly Donation Activity
            </Heading>
            <ComposedChartComp data={metrics.monthlyActivity} dataKey="total" />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}