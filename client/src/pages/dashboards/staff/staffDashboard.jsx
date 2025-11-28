import Layout from "../../../layout";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import OrganisationHome from "./staffHome";
import IncomingDonations from "./incomingDonations";
import UpdateStock from "./updateStock";
import DistributionRecords from "./distributionRecords";
import StaffHistory from "./staffHistory";
import Settings from "../../settings";

export default function AdminDashboard() {
  return (
    <Layout title="Staff Dashboard:">
      <Tabs variant="enclosed" colorScheme="green" p={6}>
        <TabList>
          <Tab>Home</Tab>
          <Tab>Incoming Donations</Tab>
          <Tab>Update Stock</Tab>
          <Tab>Distribution Records</Tab>
          <Tab>History</Tab>
          <Tab>Settings</Tab>
        </TabList>

        <TabPanels>
          <TabPanel><OrganisationHome /></TabPanel>
          <TabPanel><IncomingDonations /></TabPanel>
          <TabPanel><UpdateStock /></TabPanel>
          <TabPanel><DistributionRecords /></TabPanel>
          <TabPanel><StaffHistory /></TabPanel>
          <TabPanel><Settings /></TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
}