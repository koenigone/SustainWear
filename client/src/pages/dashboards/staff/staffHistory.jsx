// Fetch the history of an organisation including staff status change to donations, distributions
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import api from '../../../api/axiosClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../../auth/authContext';
import Timeline from '../../../components/timeline.jsx';
import { TimeFormatter } from '../../../helpers/timeFormatter';
import MultiSelect from '../../../components/multiSelect';
import ExportData from '../../../components/exportData';
import TimelineCard from '../../../components/timelineCard.jsx';

const StaffHistory = () => {
  const [loading, setLoading] = useState(true);
  const [histories, setHistories] = useState({
    distributions: [],
    donations: [],
    organisation: [],
  });
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [timelineData, setTimelineData] = useState({});
  const [isTableView, setIsTableView] = useState(true);
  const [dropwdownValues, setDropdownValues] = useState({
    staff_members: [],
    actions: [],
  });
  const [filters, setFilters] = useState({
    staff_members: [],
    actions: [],
    dateRange: { from: null, to: null },
  });

  const { organisation } = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const headers = ['Time', 'Staff Member', 'Action', 'Notes'];

  // Fetch organisation histories on mount
  useEffect(() => {
    const fetchStaffHistory = async () => {
      try {
        //   Fetch staff assingment/deactivation logs
        const resStaffHistory = await api.get(`/orgs/${organisation?.org_id}/staff-list`);
        //   Fetch distribution logs
        const resDistributionHistory = await api.get(`/orgs/${organisation?.org_id}/distribution-records`);
        //   Fetch donation status updates
        const resDonationHistory = await api.get(`/orgs/${organisation?.org_id}/donation-requests`);

        setHistories({
          distributions: resDistributionHistory?.data ?? [],
          donations: resDonationHistory?.data ?? [],
          organisation: resStaffHistory?.data ?? [],
        });
      } catch (error) {
        console.error(`Error fetching organisations histories`, error);
        toast.error('Error fetching organisations histories');
      }
    };

    fetchStaffHistory().finally(() => setLoading(false));
  }, []);

  // parse histories to rows
  useEffect(() => {
    const parseHistories = () => {
      const parsedDonations = histories.donations
        .filter((d) => d?.status?.toLocaleLowerCase() !== 'pending')
        .map((d) => {
          const {
            handled_by_staff_id: staffId,
            status,
            handled_at: handledAt,
            submitted_at: submittedAt,
            category: itemCategory,
            reason: declineReason,
            item_name: itemName,
            item_condition: itemCondition,
          } = d ?? {};

          const action = `Donation - ${status ?? 'Unknown'}`;
          const staffMember = histories.organisation.find((s) => d.handled_by_staff_id === s.staff_id);
          const staffName = staffMember?.staff_name ?? 'Unknown';
          const staffNameFull = `${staffName}[${staffId}]`;

          const timeToHandle = new Date(handledAt).getTime() - new Date(submittedAt).getTime();

          const millisecondsToDuration = (ms) => {
            let seconds = Math.floor(ms / 1000);
            let minutes = Math.floor(seconds / 60);
            seconds = seconds % 60;
            let hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            let days = Math.floor(hours / 24);
            hours = hours % 24;

            return `${days > 0 ? (days > 1 ? `${days} Days ` : `${days} Day `) : ''}${hours > 0 ? (hours > 1 ? `${hours} Hours ` : `${hours} Hour `) : ''}${minutes > 0 ? (minutes > 1 ? `${minutes} Minutes ` : `${minutes} Minute `) : ''}${seconds > 0 ? (seconds > 1 ? `${seconds} Seconds ` : `${seconds} Second `) : ''}`;
          };

          const row = [
            handledAt,
            staffNameFull,
            action,
            `Item: ${itemName}[${itemCategory}](${itemCondition})
            ${declineReason ? `Reason: ${declineReason}\n` : ''}Time to handle: ${millisecondsToDuration(timeToHandle)}`,
          ];

          return row;
        });

      const parseStaffHistory = histories.organisation
        .map((o) => {
          const {
            staff_id: staffId,
            assigned_at: assignedAt,
            removed_at: removedAt,
            staff_name: staffName,
            staff_role: staffRole,
          } = o ?? null;

          const staffNameFull = `${staffName}[${staffId}]`;

          const rowStaffAdd = [
            assignedAt,
            staffNameFull,
            `Staff - Assigned`,
            `${staffName} Was Assigned To The Role '${staffRole}'`,
          ];

          const rowStaffRemove = [
            removedAt,
            staffNameFull,
            `Staff - Removed`,
            `${staffName} Was Removed From Their Role '${staffRole}'`,
          ];

          const row = [rowStaffAdd];
          if (removedAt !== null) row.push(rowStaffRemove);

          return row;
        })
        .flat();

      const parseDistributionHistory = histories.distributions.map((d) => {
        const {
          handled_by_staff_id: staffId,
          beneficiary_group: beneficiaryGroup,
          distributed_at: distributedAt,
          category: itemCategory,
          quantity_distributed: quantity,
          staff_name: staffName,
        } = d;

        const action = `Distributed - ${beneficiaryGroup ?? 'Unknown'}`;
        const staffNameFull = `${staffName}[${staffId}]`;

        const row = [
          distributedAt,
          staffNameFull,
          action,
          `Distributed ${quantity} x ${itemCategory}${quantity > 1 ? `'s` : ''} To '${beneficiaryGroup}'`,
        ];

        return row;
      });

      setRows(
        [...parsedDonations, ...parseStaffHistory, ...parseDistributionHistory].sort(
          (a, b) => new Date(b[0]) - new Date(a[0])
        )
      );
    };

    parseHistories();
  }, [histories]);

  // Get dropdown values for filter options
  useEffect(() => {
    setDropdownValues({
      staff_members: rows
        .map((row) => row[1])
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })),
      actions: rows
        .map((row) => {
          const action = row[2];
          const [main] = action.split('-');

          if (main.trim().toLowerCase() === 'distributed') return main.trim();

          return action;
        })
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })),
    });
  }, [rows]);

  // filter histories
  useEffect(() => {
    setFilteredRows(
      rows.filter((row) => {
        const [date, staff, action] = row;

        const { staff_members, actions, dateRange } = filters;

        if (staff_members.length > 0 && !staff_members.includes(staff)) return false;

        if (actions.length > 0 && !actions.filter((a) => a === action || a.split('-')[0] === action).length > 0)
          return false;

        const recordDate = new Date(date);

        if (dateRange.from && recordDate < new Date(dateRange.from)) return false;

        if (dateRange.to && recordDate > new Date(dateRange.to)) return false;

        return true;
      })
    );
  }, [filters, rows]);

  // Parse filteredrows into timeline data
  useEffect(() => {
    setTimelineData(
      filteredRows.reduce((prev, value) => {
        const key = TimeFormatter.dateToFormat(new Date(value[0]), TimeFormatter.FormatTemplates.date);

        if (prev[key]) prev[key].push(value);
        else prev[key] = [value];

        return prev;
      }, {})
    );
  }, [filteredRows]);

  if (loading) return <Spinner />;

  return (
    <Box>
      <VStack>
        {/* Controls */}
        <HStack>
          <Button
            variant={'solid'}
            bgColor='brand.green'
            color='white'
            _hover={{ bgColor: 'brand.greenDark', textDecoration: 'underline' }}
            onClick={onOpen}
            mb={4}
            alignSelf='flex-start'
          >
            Filter
          </Button>
          <ExportData filename={'staff-history'} dataArray={[headers, ...filteredRows]} />
          <Button
            variant={'solid'}
            bgColor='brand.green'
            color='white'
            _hover={{ bgColor: 'brand.greenDark', textDecoration: 'underline' }}
            mb={4}
            alignSelf='flex-start'
            onClick={() => setIsTableView(!isTableView)}
          >
            {isTableView ? 'Switch to Timeline View' : 'Switch to Table View'}
          </Button>
        </HStack>
        {/* Filters */}
        <Drawer isOpen={isOpen} placement='left' onClose={onClose} size='sm'>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader>
              <Flex w='100%' align='center' gap={4}>
                <Heading size={'lg'}>Filters</Heading>
                <Button
                  variant={'outline'}
                  color={'brand.red'}
                  size='sm'
                  ml={'5px'}
                  mr={'25px'}
                  flex='1'
                  maxWidth='calc(100% - 50px)'
                  alignSelf='flex-end'
                  onClick={() => {
                    setFilters({
                      staff_members: [],
                      actions: [],
                      dateRange: { from: null, to: null },
                    });
                  }}
                >
                  Clear All Filters
                </Button>
                <DrawerCloseButton />
              </Flex>
            </DrawerHeader>
            <DrawerBody>
              <Box>
                <VStack spacing={3} mb={5}>
                  <Heading size='md'>Filters</Heading>
                  <Grid templateColumns='1fr' gap={4} w='100%'>
                    {/* Dropdown Filters */}
                    {Object.entries(dropwdownValues).map(([key, values], i) => (
                      <MultiSelect
                        key={i}
                        options={values}
                        selectedOptions={filters[key]}
                        onChange={(values) => {
                          setFilters((prevFilters) => ({
                            ...prevFilters,
                            [key]: values,
                          }));
                        }}
                        label={key
                          .split('_')
                          .map((w) => `${w.substring(0, 1).toUpperCase()}${w.slice(1)}`)
                          .join(' ')}
                        width={'100%'}
                      />
                    ))}
                    {/* Date Range Filters */}
                    {['from', 'to'].map((bound, i) => (
                      <Box key={i}>
                        <Heading size='sm' mb={1}>
                          Date {`${bound.substring(0, 1).toUpperCase()}${bound.slice(1)}`}
                        </Heading>
                        <Input
                          type='date'
                          value={filters.dateRange[bound] || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                [bound]: e.target.value || null,
                              },
                            }))
                          }
                        />
                      </Box>
                    ))}
                  </Grid>
                </VStack>
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        {/*  Data Table */}
        {isTableView && (
          <VStack>
            <TableContainer overflow={'auto'}>
              <Table>
                <Thead>
                  <Tr>
                    {headers.map((header, i) => (
                      <Th key={i}>{header}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredRows.map((row, rI) => (
                    <Tr key={rI}>
                      {row.map((cell, cI) => (
                        <Td key={cI} whiteSpace={'pre-line'}>
                          {isNaN(new Date(cell)) ? cell : TimeFormatter.dateToFormat(new Date(cell))}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </VStack>
        )}
        {!isTableView && (
          <VStack width={'100%'}>
            <Heading size={'md'}>Timeline</Heading>
            <Timeline>
              {timelineData &&
                Object.keys(timelineData)
                  .sort((a, b) => new Date(b) - new Date(a))
                  .map((key, i) => (
                    <TimelineCard
                      header={`${key}  (${timelineData[key].length} ${timelineData[key].length > 1 ? 'Entries' : 'Entry'})`}
                      key={i}
                    >
                      {timelineData[key].map((row, rI) => (
                        <Box key={rI} mt={'20px'}>
                          <Heading size={'sm'}>
                            {row[1]} {row[2]}
                          </Heading>
                          <Box mt={'2px'} whiteSpace={'pre-line'} borderBottom={'solid thin black'}>
                            {row[3]}
                          </Box>
                        </Box>
                      ))}
                    </TimelineCard>
                  ))}
            </Timeline>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default StaffHistory;
