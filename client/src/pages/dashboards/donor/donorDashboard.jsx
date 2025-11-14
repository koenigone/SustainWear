import Layout from "../../../layout";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import DonateItem from "./donateItem";
import DonationHistory from "./donationHistory";
import Notifications from "./notifications";
import Settings from "../../settings";
import DonorHome from "./donorHome";

export default function AdminDashboard() {
  return (
    <Layout title="Donor Dashboard:">
      <Tabs variant="enclosed" colorScheme="green" p={6}>
        <TabList>
          <Tab>Home</Tab>
          <Tab>Donate</Tab>
          <Tab>Donation History</Tab>
          <Tab>Notifications</Tab>
          <Tab>Settings</Tab>
        </TabList>

        <TabPanels>
          <TabPanel><DonorHome /></TabPanel>
          <TabPanel><DonateItem /></TabPanel>
          <TabPanel><DonationHistory /></TabPanel>
          <TabPanel><Notifications /></TabPanel>
          <TabPanel><Settings /></TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
}