import { useEffect, useState } from "react";
import { Box, SimpleGrid, Flex, Spinner, Text } from "@chakra-ui/react";
import api from "../../../api/axiosClient";

import AdminStatusChart from "../../../components/charts/admin/adminStatusChart";
import AdminActivityChart from "../../../components/charts/admin/adminActivityChart";
import AdminOrgPerformanceChart from "../../../components/charts/admin/adminOrgPerformanceChart";
import AdminEnvironmentChart from "../../../components/charts/admin/adminEnvironmentChart";
import UserGrowthChart from "../../../components/charts/admin/adminUserGrowthChart";
import DonationFunnelChart from "../../../components/charts/admin/adminDonationFunnelChart";

export default function AdminHome() {
  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [orgPerformance, setOrgPerformance] = useState([]);
  const [environmentData, setEnvironmentData] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [funnelData, setFunnelData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [
        sum,
        status,
        activity,
        performance,
        env,
        userGrowthRes,
        funnelRes,
      ] = await Promise.all([
        api.get("/admin/dashboard/summary"),
        api.get("/admin/dashboard/status-breakdown"),
        api.get("/admin/dashboard/monthly-activity"),
        api.get("/admin/dashboard/org-performance"),
        api.get("/admin/dashboard/environment-monthly"),
        api.get("/admin/metrics/user-growth"),
        api.get("/admin/metrics/donation-funnel"),
      ]);

      setSummary(sum.data);
      setStatusData(status.data);
      setActivityData(activity.data);
      setOrgPerformance(performance.data);
      setEnvironmentData(env.data);

      setUserGrowth(userGrowthRes.data);
      setFunnelData(funnelRes.data);
    } catch (err) {
      console.error("Admin dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" color="brand.green" />
      </Flex>
    );
  }

  return (
    <Box>
      {/* SUMMARY CARDS */}
      <SimpleGrid columns={[1, 2, 4]} spacing={6} mb={8}>
        <StatCard label="Total Users" value={summary.total_users} />
        <StatCard label="Donors" value={summary.total_donors} />
        <StatCard label="Staff" value={summary.total_staff} />
        <StatCard label="Admins" value={summary.total_admins} />
      </SimpleGrid>

      <SimpleGrid columns={[1, 2, 4]} spacing={6} mb={8}>
        <StatCard label="Total Donations" value={summary.total_donations} />
        <StatCard label="Accepted Donations" value={summary.total_accepted} />
        <StatCard label="Items Distributed" value={summary.total_distributed} />
        <StatCard label="People Helped" value={summary.total_beneficiaries} />
      </SimpleGrid>

      {/* CHARTS */}
      <SimpleGrid columns={[1, 2]} spacing={8} minChildWidth="350px">
        <AdminStatusChart data={statusData} loading={loading} />
        <AdminOrgPerformanceChart data={orgPerformance} loading={loading} />
        <AdminActivityChart data={activityData} loading={loading} />
        <AdminEnvironmentChart data={environmentData} loading={loading} />
      </SimpleGrid>

      {/* BOTTOM ANALYTICS */}
      <SimpleGrid columns={[1, 2]} spacing={8} mt={10} minChildWidth="350px">
        <UserGrowthChart data={userGrowth} loading={loading} />
        <DonationFunnelChart data={funnelData} loading={loading} />
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
      <Text fontSize="sm" color="gray.500" mb={1}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="700" color="brand.green">
        {value ?? 0}
      </Text>
    </Box>
  );
}