import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Divider,
  useToast,
} from "@chakra-ui/react";
import api from "../../../api/axiosClient";
import { TimeFormatter } from "../../../helpers/timeFormatter";

const RANGE_PRESETS = [
  { value: "6M", label: "Past 6 months" },
  { value: "12M", label: "Past 12 months" },
  { value: "24M", label: "Past 24 months" },
  { value: "CUSTOM", label: "Custom range" },
];

export default function AdminReports() {
  const toast = useToast();

  const [range, setRange] = useState("6M");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [includeAudit, setIncludeAudit] = useState(true);
  const [includeOrgs, setIncludeOrgs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const isCustomRange = range === "CUSTOM";

  const handleGenerate = async () => {
    if (isCustomRange && (!start || !end)) {
      toast({
        status: "warning",
        title: "Missing dates",
        description: "Please select both start and end dates for custom range.",
      });
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const payload = {
        range,
        start: isCustomRange ? start : null,
        end: isCustomRange ? end : null,
        includeAudit,
        includeOrgs,
      };

      const res = await api.post("/admin/reports/generate", payload);
      setReport(res.data);
    } catch (err) {
      toast({
        status: "error",
        title: "Failed to generate report",
        description: err?.response?.data?.errMessage || "Unexpected error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!report) {
      toast({
        status: "info",
        title: "No report data",
        description: "Generate a report before exporting.",
      });
      return;
    }

    setExportingCsv(true);
    try {
      const rows = [];

      // header row
      rows.push(["Section", "Metric", "Value", "Extra1", "Extra2"]);

      // summary
      if (report.summary) {
        rows.push([
          "Summary",
          "Total Submitted",
          report.summary.total_submitted || 0,
        ]);
        rows.push(["Summary", "Accepted", report.summary.accepted || 0]);
        rows.push(["Summary", "Declined", report.summary.declined || 0]);
      }

      // distributions
      if (report.distributions) {
        rows.push([
          "Distributions",
          "Distributed",
          report.distributions.distributed || 0,
        ]);
        rows.push([
          "Distributions",
          "CO2 Saved",
          report.distributions.co2 || 0,
        ]);
        rows.push([
          "Distributions",
          "Landfill Saved",
          report.distributions.landfill || 0,
        ]);
        rows.push([
          "Distributions",
          "Beneficiaries",
          report.distributions.beneficiaries || 0,
        ]);
      }

      // funnel
      if (report.donationFunnel) {
        rows.push([
          "Funnel",
          "Submitted",
          report.donationFunnel.submitted || 0,
        ]);
        rows.push(["Funnel", "Reviewed", report.donationFunnel.reviewed || 0]);
        rows.push(["Funnel", "Accepted", report.donationFunnel.accepted || 0]);
        rows.push([
          "Funnel",
          "Distributed",
          report.donationFunnel.distributed || 0,
        ]);
      }

      // organisation performance
      if (Array.isArray(report.organisations)) {
        report.organisations.forEach((org) => {
          rows.push([
            "Organisation",
            org.name,
            `Received: ${org.received || 0}`,
            `Accepted: ${org.accepted || 0}`,
            `Distributed: ${org.distributed || 0}`,
          ]);
        });
      }

      // user activity - staff
      if (report.userActivity?.staff) {
        report.userActivity.staff.forEach((s) => {
          rows.push(["Staff Activity", s.staff_name, s.handled || 0, "", ""]);
        });
      }

      // user activity - donors
      if (report.userActivity?.donors) {
        report.userActivity.donors.forEach((d) => {
          rows.push(["Donor Activity", d.donor_name, d.donations || 0, "", ""]);
        });
      }

      // audit summary
      if (Array.isArray(report.auditSummary)) {
        report.auditSummary.forEach((a) => {
          rows.push([
            "Audit",
            `${a.action_category}:${a.action_type}`,
            a.count || 0,
            "",
            "",
          ]);
        });
      }

      const csvContent = rows
        .map((r) =>
          r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const filename = `sustainwear-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportPdf = async () => {
    if (!report) {
      toast({
        status: "info",
        title: "No report data",
        description: "Generate a report before exporting.",
      });
      return;
    }

    setExportingPdf(true);
    try {
      const payload = {
        range,
        start: isCustomRange ? start : null,
        end: isCustomRange ? end : null,
        includeAudit,
        includeOrgs,
      };

      const res = await api.post("/admin/reports/export-pdf", payload, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const filename = `sustainwear-report-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        status: "error",
        title: "Failed to export PDF",
        description: err?.response?.data?.errMessage || "Unexpected error",
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const formattedRange = useMemo(() => {
    if (!report?.dateRange) return "";
    const { start, end } = report.dateRange;
    return `${TimeFormatter.dateToFormat(start)} → ${TimeFormatter.dateToFormat(
      end
    )}`;
  }, [report]);

  // safe defaults
  const summary = report?.summary || {};
  const dist = report?.distributions || {};
  const funnel = report?.donationFunnel || {};
  const trends = report?.trends || [];
  const orgs = report?.organisations || [];
  const staffActivity = report?.userActivity?.staff || [];
  const donorActivity = report?.userActivity?.donors || [];
  const auditSummary = report?.auditSummary || [];

  return (
    <Box p={6} bg="white" rounded="lg" boxShadow="md">
      {/* Filters + Actions */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        gap={4}
        mb={6}
        align={{ base: "stretch", md: "center" }}
      >
        <Box>
          <Text fontSize="sm" color="gray.500">
            Generate detailed platform reports and export them as CSV or PDF.
          </Text>
        </Box>

        <HStack spacing={3} align="center">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            isDisabled={!report}
            isLoading={exportingCsv}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            colorScheme="green"
            onClick={handleExportPdf}
            isDisabled={!report}
            isLoading={exportingPdf}
          >
            Export PDF
          </Button>
        </HStack>
      </Flex>

      {/* Filter panel */}
      <Box
        mb={6}
        p={4}
        borderWidth="1px"
        borderRadius="md"
        borderColor="gray.200"
        bg="gray.50"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={4}
          align={{ base: "stretch", md: "flex-end" }}
        >
          <Box minW={{ base: "100%", md: "200px" }}>
            <Text fontSize="xs" color="gray.600" mb={1}>
              Date Range
            </Text>
            <Select
              size="sm"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              {RANGE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </Box>

          {isCustomRange && (
            <>
              <Box>
                <Text fontSize="xs" color="gray.600" mb={1}>
                  Start
                </Text>
                <Input
                  size="sm"
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.600" mb={1}>
                  End
                </Text>
                <Input
                  size="sm"
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </Box>
            </>
          )}

          <Flex
            flex="1"
            gap={4}
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
          >
            <Checkbox
              isChecked={includeOrgs}
              onChange={(e) => setIncludeOrgs(e.target.checked)}
              size="sm"
            >
              Include organisation performance
            </Checkbox>
            <Checkbox
              isChecked={includeAudit}
              onChange={(e) => setIncludeAudit(e.target.checked)}
              size="sm"
            >
              Include audit summary
            </Checkbox>
          </Flex>

          <Button
            colorScheme="green"
            size="sm"
            onClick={handleGenerate}
            isLoading={loading}
          >
            Generate Report
          </Button>
        </Flex>
      </Box>

      {/* loading / empty state */}
      {loading && (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      )}

      {!loading && !report && (
        <Box textAlign="center" py={10}>
          <Text color="gray.500">
            Configure your filters above and click{" "}
            <Text as="span" fontWeight="semibold">
              Generate Report
            </Text>{" "}
            to get started.
          </Text>
        </Box>
      )}

      {/* report content */}
      {!loading && report && (
        <>
          {/* range label */}
          <Flex justify="flex-end" mb={3}>
            <Text fontSize="sm" color="gray.500" textAlign="right">
              Reporting period: {formattedRange}
            </Text>
          </Flex>

          {/* summary stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
            <StatCard
              label="Total Donations Submitted"
              value={summary.total_submitted || 0}
            />
            <StatCard
              label="Accepted Donations"
              value={summary.accepted || 0}
            />
            <StatCard
              label="Declined Donations"
              value={summary.declined || 0}
            />
            <StatCard label="Items Distributed" value={dist.distributed || 0} />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={8}>
            <StatCard label="CO₂ Saved (kg)" value={dist.co2 || 0} />
            <StatCard label="Landfill Saved (kg)" value={dist.landfill || 0} />
            <StatCard
              label="Estimated Beneficiaries"
              value={dist.beneficiaries || 0}
            />
          </SimpleGrid>

          {/* donation funnel */}
          <Section title="Donation Funnel">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Stage</Th>
                  <Th isNumeric>Count</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Submitted</Td>
                  <Td isNumeric>{funnel.submitted || 0}</Td>
                </Tr>
                <Tr>
                  <Td>Reviewed</Td>
                  <Td isNumeric>{funnel.reviewed || 0}</Td>
                </Tr>
                <Tr>
                  <Td>Accepted</Td>
                  <Td isNumeric>{funnel.accepted || 0}</Td>
                </Tr>
                <Tr>
                  <Td>Distributed</Td>
                  <Td isNumeric>{funnel.distributed || 0}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Section>

          {/* trends */}
          <Section title="Donation Trends (by Month)">
            {trends.length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                No data available for this period.
              </Text>
            ) : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Month</Th>
                    <Th isNumeric>Submissions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {trends.map((row) => (
                    <Tr key={row.month}>
                      <Td>{row.month}</Td>
                      <Td isNumeric>{row.submissions}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Section>

          {/* org performance */}
          {includeOrgs && (
            <Section title="Organisation Performance">
              {orgs.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  No organisation activity in this period.
                </Text>
              ) : (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Organisation</Th>
                      <Th isNumeric>Received</Th>
                      <Th isNumeric>Accepted</Th>
                      <Th isNumeric>Distributed</Th>
                      <Th isNumeric>CO₂ Saved</Th>
                      <Th isNumeric>Beneficiaries</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orgs.map((org) => (
                      <Tr key={org.org_id}>
                        <Td>{org.name}</Td>
                        <Td isNumeric>{org.received || 0}</Td>
                        <Td isNumeric>{org.accepted || 0}</Td>
                        <Td isNumeric>{org.distributed || 0}</Td>
                        <Td isNumeric>{org.co2 || 0}</Td>
                        <Td isNumeric>{org.beneficiaries || 0}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Section>
          )}

          {/* user activity */}
          <Section title="User Activity">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Heading size="sm" mb={2}>
                  Staff Activity
                </Heading>
                {staffActivity.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No staff activity in this period.
                  </Text>
                ) : (
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Staff Member</Th>
                        <Th isNumeric>Handled Donations</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {staffActivity.map((s, idx) => (
                        <Tr key={idx}>
                          <Td>{s.staff_name || "—"}</Td>
                          <Td isNumeric>{s.handled || 0}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>

              <Box>
                <Heading size="sm" mb={2}>
                  Donor Activity
                </Heading>
                {donorActivity.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No donor activity in this period.
                  </Text>
                ) : (
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Donor</Th>
                        <Th isNumeric>Donations</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {donorActivity.map((d, idx) => (
                        <Tr key={idx}>
                          <Td>{d.donor_name || "—"}</Td>
                          <Td isNumeric>{d.donations || 0}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </SimpleGrid>
          </Section>

          {/* audit summary */}
          {includeAudit && (
            <Section title="Admin Audit Summary">
              {auditSummary.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  No admin activity recorded in this period.
                </Text>
              ) : (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Category</Th>
                      <Th>Action Type</Th>
                      <Th isNumeric>Count</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {auditSummary.map((a, idx) => (
                      <Tr key={idx}>
                        <Td>{a.action_category}</Td>
                        <Td>{a.action_type}</Td>
                        <Td isNumeric>{a.count || 0}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Section>
          )}
        </>
      )}
    </Box>
  );
}

// small building blocks
function StatCard({ label, value }) {
  return (
    <Stat
      p={3}
      borderWidth="1px"
      borderRadius="md"
      borderColor="gray.200"
      bg="gray.50"
    >
      <StatLabel fontSize="xs" color="gray.500">
        {label}
      </StatLabel>
      <StatNumber fontSize="lg">{value}</StatNumber>
    </Stat>
  );
}

function Section({ title, children }) {
  return (
    <Box mb={8}>
      <Heading size="sm" mb={2}>
        {title}
      </Heading>
      <Divider mb={3} />
      {children}
    </Box>
  );
}