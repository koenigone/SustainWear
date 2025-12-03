import { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react";

import api from "../../../api/axiosClient";

// charts
import LineChartComp from "../../../components/charts/lineChart";
import BarChartComp from "../../../components/charts/barChartBeneficiaries";
import PieChartComp from "../../../components/charts/pieChart";
import DoughnutChartComp from "../../../components/charts/doughnutChart";
import ComposedChartComp from "../../../components/charts/composedChart";
import VerticalChart from "../../../components/charts/verticalChart";

export default function AdminHome() {
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [orgPerf, setOrgPerf] = useState([]);
  const [sustainability, setSustainability] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [
          summaryRes,
          monthlyRes,
          catRes,
          statusRes,
          perfRes,
          sustRes,
          rolesRes,
        ] = await Promise.all([
          api.get(`/admin/summary`),
          api.get(`/admin/monthly-trend`),
          api.get(`/admin/categories`),
          api.get(`/admin/statuses`),
          api.get(`/admin/organisation-performance`),
          api.get(`/admin/sustainability-total`),
          api.get(`/admin/user-activity`),
        ]);

        setSummary(summaryRes.data);
        setMonthly(monthlyRes.data);
        setCategories(catRes.data);
        setStatuses(statusRes.data);
        setOrgPerf(perfRes.data);
        setSustainability(sustRes.data);
        setUserRoles(rolesRes.data);
      } catch (err) {
        console.error("Failed loading admin metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) return <Spinner size="xl" mt={10} />;
  if (!summary) return null;

  return (
    <Box>
      {/* SUMMARY CARDS */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <SummaryCard label="Total Donations" value={summary.total_donations} />
        <SummaryCard label="Accepted" value={summary.accepted} />
        <SummaryCard label="Declined" value={summary.declined} />
        <SummaryCard label="Users" value={summary.total_users} />
        <SummaryCard label="Organisations" value={summary.total_organisations} />
        <SummaryCard label="CO₂ Saved (kg)" value={summary.total_co2 || 0} />
      </SimpleGrid>

      {/* CHARTS GRID */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* monthly donations (Line chart) */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>Monthly Donation Trend</Heading>
          <LineChartComp
            data={monthly}
            xKey="month"
            dataKey="count"
          />
        </Box>

        {/* categories (Bar chart) */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>Category Breakdown</Heading>
          <BarChartComp
            data={categories}
            xKey="category"
            dataKey="count"
          />
        </Box>

        {/* status breakdown (Doughnut chart) */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>Donation Status Breakdown</Heading>
          <DoughnutChartComp
            data={statuses}
            dataKey="count"
          />
        </Box>

        {/* organisation performance (Vertical bar chart) */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>Organisation Performance</Heading>
          <VerticalChart
            data={orgPerf}
            dataKey="accepted"
            categoryKey="org_name"
          />
        </Box>

        {/* sustainability overview (Composed chart) */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>Sustainability Impact</Heading>
          <ComposedChartComp
            data={[
              {
                month: "Total",
                total: sustainability.total_beneficiaries,
                co2: sustainability.total_co2,
                landfill: sustainability.total_landfill,
              },
            ]}
            dataKey="total"
          />
        </Box>

        {/* user roles (Pie chart) */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={2}>User Roles Distribution</Heading>
          <PieChartComp
            data={userRoles}
            dataKey="count"
            nameKey="role"
          />
        </Box>
      </SimpleGrid>
    </Box>
  );
}

/* SUMMARY CARD */
function SummaryCard({ label, value }) {
  return (
    <Box p={5} borderRadius="md" bg="white" shadow="md" textAlign="center">
      <Heading size="lg">{value ?? 0}</Heading>
      <Text mt={2} color="gray.600">
        {label}
      </Text>
    </Box>
  );
}