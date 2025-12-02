import { HStack } from "@chakra-ui/react";
import DashboardLayout from "../../../components/dashboardLayout";

// admin main tabs
import AdminHome from "./adminHome";
import ManageUsers from "./manageUsers";
import ManageOrganisations from "./manageOrganisations";
import ManageReports from "./manageReports";
import AdminLog from "./adminLog";

// react icons
import { IoPieChartSharp } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { FaHandsHelping } from "react-icons/fa";
import { BiSolidReport } from "react-icons/bi";
import { FaList } from "react-icons/fa";

export default function AdminDashboard() {
  const tabs = [
    {
      label: "Overview",
      descriptiveTitle: "Home and Overview",
      customLabel: (
        <HStack spacing={2}>
          <IoPieChartSharp size="18" color="#38A169" />
          <span>Overview</span>
        </HStack>
      ),
      component: <AdminHome />,
    },
    {
      label: "Manage Users",
      descriptiveTitle: "Manage Users Activity and Roles",
      customLabel: (
        <HStack spacing={2}>
          <FaUsers size="18" color="#38a169" />
          <span>Manage Users</span>
        </HStack>
      ),
      component: <ManageUsers />,
    },
    {
      label: "Manage Organisations",
      descriptiveTitle: "Manage Organisations and Their Staff",
      customLabel: (
        <HStack spacing={2}>
          <FaHandsHelping size="18" color="#38A169" />
          <span>Manage Organisations</span>
        </HStack>
      ),
      component: <ManageOrganisations />,
    },
    {
      label: "Manage Reports",
      descriptiveTitle: "Manage and Generate Systems Reports",
      customLabel: (
        <HStack spacing={2}>
          <BiSolidReport size="18" color="#38A169" />
          <span>Manage Reports</span>
        </HStack>
      ),
      component: <ManageReports />,
    },
    {
      label: "Admin Log",
      descriptiveTitle: "View Admin Activity with Details",
      customLabel: (
        <HStack spacing={2}>
          <FaList size="18" color="#38A169" />
          <span>Admin Log</span>
        </HStack>
      ),
      component: <AdminLog />,
    },
  ];

  return <DashboardLayout tabs={tabs} />;
}