import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa";
import toast from "react-hot-toast";

/**
 * A component to export a JSON array of data as a CSV file.
 * @param {Object[]} json - Array of objects representing the data to export
 * @param {string} [filename="exported_data"] - Desired filename for the exported File (without extension)
 * @returns {JSX.Element}
 */
const ExportData = ({ json, filename = "exported_data" }) => {
  if (!filename) {
    filename = "exported_data";
  } else filename = filename.trim().replace(/ /g, "_");

  const exportAsCsv = () => {
    try {
      if (!json || !Array.isArray(json) || json.length === 0) {
        toast.error("No data available to export.");
        return;
      }

      const replacer = (key, value) => (value === null ? "" : value);
      const header = Object.keys(json[0]);
      const csv = [
        header.join(","),
        ...json.map((row) =>
          header
            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(",")
        ),
      ].join("\r\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);
      toast.success("Data exported successfully.");
    } catch (error) {
      console.error("Error exporting data as CSV:", error);
      toast.error("Failed to export data.");
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<FaChevronDown />}
        mb={4}
        bgColor="brand.green"
        color="white"
        _hover={{ bgColor: "brand.greenDark", textDecoration: "underline" }}
        _active={{ bgColor: "brand.greenDark" }}
      >
        Export
      </MenuButton>

      <MenuList>
        <MenuItem onClick={exportAsCsv}>As CSV</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ExportData;
