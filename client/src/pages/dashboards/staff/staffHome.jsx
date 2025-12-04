import { useEffect, useState } from "react";
import { Box, SimpleGrid, Flex, Spinner, Text } from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import { useAuth } from "../../../auth/authContext";

import OrgStatusChart from "../../../components/charts/staff/orgStatusChart";
import OrgCategoryChart from "../../../components/charts/staff/orgCategoryChart";
import OrgDistributionChart from "../../../components/charts/staff/orgDistributionChart";
import OrgEnvironmentChart from "../../../components/charts/staff/orgEnvironmentChart";

export default function OrgHome() {
  const { organisation } = useAuth();
  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [environmentData, setEnvironmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organisation) {
      setLoading(false);
      return;
    }
    loadAll();
  }, [organisation]);

  const loadAll = async () => {
    try {
      const orgId = organisation.org_id || organisation.id;

      const [sum, status, category, dist, env] = await Promise.all([
        api.get(`/orgs/${orgId}/dashboard/summary`),
        api.get(`/orgs/${orgId}/dashboard/status`),
        api.get(`/orgs/${orgId}/dashboard/categories`),
        api.get(`/orgs/${orgId}/dashboard/distribution-monthly`),
        api.get(`/orgs/${orgId}/dashboard/environment-monthly`),
      ]);

      setSummary(sum.data);
      setStatusData(status.data);
      setCategoryData(category.data);
      setDistributionData(dist.data);
      setEnvironmentData(env.data);
    } catch (err) {
      console.error("Org dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!organisation) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Text color="gray.600">
          You are not assigned to an organisation yet.
        </Text>
      </Flex>
    );
  }

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
        <StatCard label="Pending Requests" value={summary.pending_requests} />
        <StatCard
          label="Accepted Donations"
          value={summary.accepted_donations}
        />
        <StatCard label="Items Distributed" value={summary.items_distributed} />
        <StatCard label="People Helped" value={summary.beneficiaries_served} />
      </SimpleGrid>

      {/* CHARTS */}
      <SimpleGrid columns={[1, 2]} spacing={8} minChildWidth="350px">
        <OrgStatusChart data={statusData} loading={loading} />
        <OrgCategoryChart data={categoryData} loading={loading} />
        <OrgDistributionChart data={distributionData} loading={loading} />
        <OrgEnvironmentChart data={environmentData} loading={loading} />
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