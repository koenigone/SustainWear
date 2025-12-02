import DashboardLayout from "../../../components/dashboardLayout";
import { HStack, Badge } from "@chakra-ui/react";
import { useNotifications } from "../../../components/notificationsContext";

// donor main tabs
import DonorHome from "./donorHome";
import DonateItem from "./donateItem";
import DonationHistory from "./donationHistory";
import Notifications from "./notifications";
import Settings from "../../settings";

// react icons
import { FaBell, FaHistory } from "react-icons/fa";
import { IoMdHome } from "react-icons/io";
import { BiSolidDonateHeart } from "react-icons/bi";
import { FaGear } from "react-icons/fa6";

export default function DonorDashboard() {
  const { unreadCount } = useNotifications();

  const tabs = [
    {
      label: "Home",
      descriptiveTitle: "Home and Overview",
      customLabel: (
        <HStack spacing={2}>
          <IoMdHome size="18" color="#38A169" />
          <span>Home</span>
        </HStack>
      ),
      component: <DonorHome />,
    },
    {
      label: "Donate",
      descriptiveTitle: "Donate Items to Organisations",
      customLabel: (
        <HStack spacing={2}>
          <BiSolidDonateHeart size="18" color="#38A169" />
          <span>Donate</span>
        </HStack>
      ),
      component: <DonateItem />,
    },
    {
      label: "Donation History",
      descriptiveTitle: "View Your Donation History",
      customLabel: (
        <HStack spacing={2}>
          <FaHistory size="18" color="#38A169" />
          <span>Donation History</span>
        </HStack>
      ),
      component: <DonationHistory />,
    },
    {
      label: "Notifications",
      descriptiveTitle: "View Notifications and Updates",
      customLabel: (
        <HStack spacing={2}>
          <FaBell size="18" color="#38A169" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge colorScheme="green" borderRadius="full" px={2}>
              {unreadCount}
            </Badge>
          )}
        </HStack>
      ),
      component: (isActive) => <Notifications isActive={isActive} />,
    },
    {
      label: "Settings",
      descriptiveTitle: "Manage Donor Settings",
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