import Layout from "../../../layout";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Button, Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import IncomingDonations from "./incomingDonations";
import UpdateStock from "./updateStock";
import DistributionRecords from "./distributionRecords";
import Settings from "../../settings";

export default function StaffDashboard() {
  const navigate = useNavigate();

  return (
    <Layout title="Staff Dashboard:">
      <Box mb={4}>
        <Button
          colorScheme="green"
          w="250px"
          onClick={() => navigate("/staff/activity")}
        >
          View Activity History
        </Button>
      </Box>

      <Tabs variant="enclosed" colorScheme="green" p={6}>
        <TabList>
          <Tab>Incoming Donations</Tab>
          <Tab>Update Stock</Tab>
          <Tab>Distribution Records</Tab>
          <Tab>Settings</Tab>
        </TabList>

        <TabPanels>
          <TabPanel><IncomingDonations /></TabPanel>
          <TabPanel><UpdateStock /></TabPanel>
          <TabPanel><DistributionRecords /></TabPanel>
          <TabPanel><Settings /></TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
}
