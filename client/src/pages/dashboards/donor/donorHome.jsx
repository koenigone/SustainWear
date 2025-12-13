import { useEffect, useState } from "react";
import {
  SimpleGrid,
  Box,
  Text,
  Flex,
  Spinner,
  GridItem,
} from "@chakra-ui/react";
import api from "../../../api/axiosClient";

import DoughnutChartStatus from "../../../components/charts/donor/doughbutChart";
import PieChartCategories from "../../../components/charts/donor/pieChart";
import BarChartImpact from "../../../components/charts/donor/barChart";
import RadialLandfillGauge from "../../../components/charts/donor/raddialLandfillGauge";
import RecentActivity from "../../../components/charts/donor/recentActivityChart";
import DonorLeaderboard from "../../../components/charts/donor/leaderboardChart";

export default function DonorHome() {
  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [impactData, setImpactData] = useState([]);
  const [recentActivity, setRecentData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [sum, status, category, impact, recent, leaderboard] =
        await Promise.all([
          api.get("/donor/dashboard/summary"),
          api.get("/donor/dashboard/status"),
          api.get("/donor/dashboard/categories"),
          api.get("/donor/dashboard/monthly-impact"),
          api.get("/donor/dashboard/recent-activity"),
          api.get("/donor/dashboard/leaderboard"),
        ]);

      setSummary(sum.data);
      setStatusData(status.data);
      setCategoryData(category.data);
      setImpactData(impact.data);
      setRecentData(recent.data);
      setLeaderboardData(leaderboard.data);
    } catch (err) {
      console.error("Donor dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary || !leaderboardData) {
    return (
      <Flex justify="center" align="center" h="80vh">
        <Spinner size="xl" color="brand.green" />
      </Flex>
    );
  }

  return (
    <Box as="main">
      {/* SUMMARY CARDS */}
      <SimpleGrid columns={[1, 2, 4]} spacing={6} mb={8}>
        <StatCard label="Total Donations" value={summary.total_donations} />
        <StatCard label="CO₂ Saved (kg)" value={summary.total_co2.toFixed(1)} />
        <StatCard
          label="Landfill Saved (kg)"
          value={summary.total_landfill.toFixed(1)}
        />
        <StatCard label="People Helped" value={summary.total_beneficiaries} />
      </SimpleGrid>

      {/* MAIN CHARTS */}
      <SimpleGrid columns={[1, 2]} spacing={8} minChildWidth="350px">
        <DoughnutChartStatus data={statusData} loading={loading} />
        <PieChartCategories data={categoryData} loading={loading} />
        <BarChartImpact data={impactData} loading={loading} />
        <RadialLandfillGauge data={impactData} loading={loading} />
      </SimpleGrid>

      {/* RECENT + LEADERBOARD */}
      <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} spacing={8} mt={10} alignItems="stretch">
        <GridItem colSpan={1}>
          <RecentActivity data={recentActivity} />
        </GridItem>

        <GridItem colSpan={1}>
          <DonorLeaderboard
            leaderboard={leaderboardData.leaderboard}
            rank={leaderboardData.rank}
            currentUser={leaderboardData.currentUser}
          />
        </GridItem>
      </SimpleGrid>
    </Box>
  );
}

function StatCard({ label, value }) {
  return (
    <Box
      p={5}
      bg="white"
      borderRadius="lg"
      shadow="sm"
      border="1px solid"
      borderColor="gray.200"
    >
      <Text fontSize="sm" color="gray.700" mb={1}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="700" color="brand.green">
        {value}
      </Text>
    </Box>
  );
}