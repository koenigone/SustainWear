import Layout from "../layout";
import { useState } from "react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Flex,
} from "@chakra-ui/react";

export default function DashboardLayout({ tabs }) {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Layout title={tabs[tabIndex].descriptiveTitle}>
      <Flex direction="column" flex="1" overflow="hidden">
        {/* tabs wrapper (non-scrollable) */}
        <Tabs
          variant="enclosed"
          colorScheme="green"
          onChange={setTabIndex}
          index={tabIndex}
          display="flex"
          flexDirection="column"
          flex="1"
          overflow="hidden"
        >
          {/* tabs List */}
          <TabList
            overflowX="auto"
            overflowY="hidden"
            flexShrink={0}
            css={{
              "&::-webkit-scrollbar": { height: "4px" },
              "&::-webkit-scrollbar-thumb": {
                background: "#38A169",
                borderRadius: "4px",
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} fontSize={{ base: "sm", md: "md" }}>
                <Box
                  sx={{ "& span": { display: { base: "none", md: "inline" } } }}
                >
                  {tab.customLabel || tab.label}
                </Box>
              </Tab>
            ))}
          </TabList>

          {/* panels wrapper - scrollable */}
          <TabPanels
            flex="1"
            overflowY="auto"
            overflowX="hidden"
            px={{ base: 0, md: 4 }}
            py={2}
          >
            {tabs.map((tab, index) => (
              <TabPanel key={index} px={0}>
                {typeof tab.component === "function"
                  ? tab.component(tabIndex === index)
                  : tab.component}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Flex>
    </Layout>
  );
}