import { useEffect, useState } from "react";
import { Box, Heading, SimpleGrid, Spinner } from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import { useAuth } from "../../../auth/authContext";

// organisation charts
import OrgMonthlyTrendChart from "../../../components/charts/orgCharts/monthlyTrendChart";
import OrgCategoryChart from "../../../components/charts/orgCharts/orgCategoryChart";
import OrgStatusChart from "../../../components/charts/orgCharts/orgStatusChart";
import OrgCO2Chart from "../../../components/charts/orgCharts/orgCO2Chart";
import OrgLandfillChart from "../../../components/charts/orgCharts/orgLandfillChart";
import OrgHandlingTimeChart from "../../../components/charts/orgCharts/orgHandlingTimeChart";

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

  return (
    <Box>
      <Heading size="lg" mb={5}>
        Organisation Dashboard {organisation?.org_name}
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* monthly donations trend */}
        <OrgMonthlyTrendChart data={monthly} />

        {/* category breakdown */}
        <OrgCategoryChart data={categories} />

        {/* status breakdown */}
        <OrgStatusChart data={summary} />

        {/* CO2 saved */}
        <OrgCO2Chart data={summary} />

        {/* landfill saved */}
        <OrgLandfillChart data={summary} />

        {/* avg handling time */}
        <OrgHandlingTimeChart data={handling} />
      </SimpleGrid>
    </Box>
  );
}