import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * A component to export a JSON array of data as a CSV file.
 * @param {Object[]} json - Array of objects representing the data to export
 * @param {string[][]} dataArray - 2D array of strings representing the data to export, e.g. [['A', 'B'], ['1', '2']]. An alternative to passing the JSON array.
 * @param {string} [filename="exported_data"] - Desired filename for the exported File (without extension)
 * @returns {JSX.Element}
 */
const ExportData = ({ json, dataArray, filename = 'exported_data' }) => {
  if (!filename) {
    filename = 'exported_data';
  } else filename = filename.trim().replace(/ /g, '_');

  const exportAsCsv = () => {
    try {
      let csv = null;

      if (dataArray && Array.isArray(dataArray) && dataArray.length > 0) {
        const header = dataArray[0];
        csv = [
          header.join(','),
          ...dataArray.slice(1).map((r) =>
            r
              .map((v) => {
                if (v == null) return '';
                const s = String(v).replace(/\r?\n|\r/g, ' ');
                return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
              })
              .join(',')
          ),
        ].join('\r\n');
      }

      if (json && Array.isArray(json) && json.length > 0 && typeof json[0] === 'object') {
        const replacer = (key, value) => (value === null ? '' : value);
        const header = Object.keys(json[0]);
        csv = [
          header.join(','),
          ...json.map((row) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')),
        ].join('\r\n');
      }

      if (!csv) {
        toast.error('No data available to export.');
        return;
      }

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);
      toast.success('Data exported successfully.');
    } catch (error) {
      console.error('Error exporting data as CSV:', error);
      toast.error('Failed to export data.');
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<FaChevronDown />}
        mb={4}
        bgColor='brand.green'
        color='white'
        _hover={{ bgColor: 'brand.greenDark', textDecoration: 'underline' }}
        _active={{ bgColor: 'brand.greenDark' }}
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
