import { HStack } from "@chakra-ui/react";
import DashboardLayout from "../../../components/dashboardLayout";
import OrganisationHome from "./staffHome";
import IncomingDonations from "./incomingDonations";
import UpdateStock from "./updateStock";
import DistributionRecords from "./distributionRecords";
import StaffHistory from "./staffHistory";
import Settings from "../../settings";

// react icons
import { IoPieChartSharp } from "react-icons/io5";
import { FaExclamationCircle } from "react-icons/fa";
import { IoMdBasket } from "react-icons/io";
import { FaList } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

export default function StaffDashboard() {
  const tabs = [
    {
      label: "Overview",
      descriptiveTitle: "Organisation Overview",
      customLabel: (
        <HStack spacing={2}>
          <IoPieChartSharp size="18" color="#38A169" />
          <span>Overview</span>
        </HStack>
      ),
      component: <OrganisationHome />,
    },
    {
      label: "Incoming Donations",
      descriptiveTitle: "Manage Incoming Donations",
      customLabel: (
        <HStack spacing={2}>
          <FaExclamationCircle size="18" color="#38A169" />
          <span>Incoming Donations</span>
        </HStack>
      ),
      component: <IncomingDonations />,
    },
    {
      label: "Update Stock",
      descriptiveTitle: "Update Stock and Inventory",
      customLabel: (
        <HStack spacing={2}>
          <IoMdBasket size="18" color="#38A169" />
          <span>Update Stock</span>
        </HStack>
      ),
      component: <UpdateStock />,
    },
    {
      label: "Distribution Records",
      descriptiveTitle: "View and Manage Distribution Records",
      customLabel: (
        <HStack spacing={2}>
          <FaList size="18" color="#38A169" />
          <span>Distrubtion Records</span>
        </HStack>
      ),
      component: <DistributionRecords />,
    },
    {
      label: "History",
      descriptiveTitle: "View Staff Activity History",
      customLabel: (
        <HStack spacing={2}>
          <FaHistory size="18" color="#38A169" />
          <span>History</span>
        </HStack>
      ),
      component: <StaffHistory />,
    },
    {
      label: "Settings",
      descriptiveTitle: "Account Settings",
      customLabel: (
        <HStack spacing={2}>
          <FaGear size="18" color="#38A169" />
          <span>Settings</span>
        </HStack>
      ),
      component: <Settings />,
    },
  ];

  return <DashboardLayout tabs={tabs} />;
}