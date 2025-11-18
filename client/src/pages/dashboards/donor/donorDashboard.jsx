import Layout from "../../../layout";
import { Tabs, TabList, TabPanels, Tab, TabPanel, HStack, Badge } from "@chakra-ui/react";
import { useState } from "react";
import { useNotifications } from "../../../components/notificationsContext";

import DonateItem from "./donateItem";
import DonationHistory from "./donationHistory";
import Notifications from "./notifications";
import Settings from "../../settings";
import DonorHome from "./donorHome";

export default function DonorDashboard() {
  const { unreadCount } = useNotifications();
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Layout title="Donor Dashboard:">
      <Tabs
        variant="enclosed"
        colorScheme="green"
        p={6}
        index={tabIndex}
        onChange={(i) => setTabIndex(i)}
      >
        <TabList>
          <Tab>Home</Tab>
          <Tab>Donate</Tab>
          <Tab>Donation History</Tab>
          <Tab>
            <HStack spacing={2}>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge colorScheme="green" borderRadius="full" px={2}>
                  {unreadCount}
                </Badge>
              )}
            </HStack>
          </Tab>
          <Tab>Settings</Tab>
        </TabList>

        <TabPanels>
          <TabPanel><DonorHome /></TabPanel>
          <TabPanel><DonateItem /></TabPanel>
          <TabPanel><DonationHistory /></TabPanel>

          <TabPanel>
            <Notifications isActive={tabIndex === 3} />
          </TabPanel>

          <TabPanel><Settings /></TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
}