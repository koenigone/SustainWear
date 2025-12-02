import {
  Box,
  SimpleGrid,
  GridItem,
  Heading,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "../../../api/axiosClient";
import { useAuth } from "../../../auth/authContext";

// reusable charts
import LineChartComp from "../../../components/charts/lineChartCO2";
import AreaChartComp from "../../../components/charts/areaChartLS";
import BarChartComp from "../../../components/charts/barChartBeneficiaries";
import PieChartComp from "../../../components/charts/pieChartCB";
import DoughnutChartComp from "../../../components/charts/doughnutChartSB";
import ComposedChartComp from "../../../components/charts/composedChartMA";

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
  }, [user.user_id]);

  if (loading)
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" color="green.500" />
      </Box>
    );

  if (!metrics) return null;

  return (
    <Box p={6}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* CO2 saved */}
        <GridItem>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              CO₂ Saved Over Time
            </Heading>
            <LineChartComp
              data={metrics.co2OverTime}
              xKey="date"
              dataKey="total_co2"
            />
          </Box>
        </GridItem>

        {/* landfill saved */}
        <GridItem>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              Landfill Weight Saved (kg)
            </Heading>
            <AreaChartComp
              data={metrics.landfillOverTime}
              xKey="date"
              dataKey="total_landfill"
            />
          </Box>
        </GridItem>

        {/* beneficiaries */}
        <GridItem>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              People Benefited Over Time
            </Heading>
            <BarChartComp
              data={metrics.beneficiariesOverTime}
              xKey="date"
              dataKey="total_beneficiaries"
            />
          </Box>
        </GridItem>

        {/* category breakdown */}
        <GridItem>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              Donation Categories
            </Heading>
            <PieChartComp
              data={metrics.categoryBreakdown}
              dataKey="total"
              nameKey="category"
            />
          </Box>
        </GridItem>

        {/* status breakdown */}
        <GridItem>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              Donation Status Overview
            </Heading>
            <DoughnutChartComp data={metrics.statusBreakdown} dataKey="total" />
          </Box>
        </GridItem>

        {/* monthly activity */}
        <GridItem>
          <Box p={4} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading size="md" mb={2}>
              Monthly Donation Activity
            </Heading>
            <ComposedChartComp
              data={metrics.monthlyActivity}
              dataKey="total"
            />
          </Box>
        </GridItem>
      </SimpleGrid>
    </Box>
  );
}
