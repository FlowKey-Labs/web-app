import MembersHeader from '../headers/MembersHeader';
import plusIcon from '../../assets/icons/plusWhite.svg';
import { Client, GroupData, BookingRequest, ClientSource } from '../../types/clientTypes';
import Table from '../common/Table';
import BookingRequestsTable from './BookingRequestsTable';
import {
  useGetClients,
  useDeactivateClient,
  useActivateClient,
  useGetGroups,
  useGetBookingRequests,
  useApproveBookingRequest,
  useRejectBookingRequest,
  useCancelBookingRequest,
} from '../../hooks/reactQuery';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import {
  Progress,
  Group,
  Modal,
  Text,
  Button as MantineButton,
  Menu,
  Loader,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useExportClients } from '../../hooks/useExport';
import { useExportGroups } from '../../hooks/useExport';
import { useNavigate } from 'react-router-dom';
import { navigateToClientDetails, navigateToGroupDetails } from '../../utils/navigationHelpers';
import { safeToString } from '../../utils/stringUtils';
import EmptyDataPage from '../common/EmptyDataPage';
import { useAuthStore } from '../../store/auth';
import { useUIStore } from '../../store/ui';
import ErrorBoundary from '../common/ErrorBoundary';
import { PaginatedResponse } from '../../api/api';


const clientColumnHelper = createColumnHelper<Client>();
const groupColumnHelper = createColumnHelper<GroupData>();

// Client Source Badge Component
const ClientSourceBadge = ({ source, className = "" }: { source?: ClientSource; className?: string }) => {
  const getBadgeProps = (source?: ClientSource) => {
    switch (source) {
      case 'booking_link':
        return {
          color: 'blue',
          variant: 'light',
          label: 'Booking'
        };
      case 'manual':
      default:
        return {
          color: 'gray',
          variant: 'light',
          label: 'Manual'
        };
    }
  };

  const props = getBadgeProps(source);
  
  return (
    <Badge 
      color={props.color} 
      variant={props.variant}
      size="sm"
      className={className}
    >
      {props.label}
    </Badge>
  );
};

const AllClients = () => {
  const [pageIndex, setPageIndex] = useState(1);

  const [rowSelection, setRowSelection] = useState({});
  const [selectedClient, setSelectedClient] = useState<
    Client | GroupData | null
  >(null); 
  const [opened, { open, close }] = useDisclosure(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activeView, setActiveView] = useState<'clients' | 'groups' | 'bookings'>('clients');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const navigate = useNavigate();
  const { openDrawer } = useUIStore();
  const deactivateClientMutation = useDeactivateClient();
  const activateClientMutation = useActivateClient();

  const permisions = useAuthStore((state) => state.role);

  const {
    data = {} as PaginatedResponse<Client>,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetClients(
    pageIndex, 
    10, 
    activeView === 'clients' ? debouncedSearchQuery : undefined
  );

  // Filter out empty/invalid client records
  const validClients = useMemo(() => {
    if (!data.items) return [];
    return data.items.filter((client: Client) => {
      // Filter out clients with completely empty data
      return client && 
             client.id && 
             (client.first_name?.trim() || client.last_name?.trim() || client.email?.trim());
    });
  }, [data.items]);

  const allClients = useMemo(() => validClients, [validClients])

  const {
    data: allGroups = [],
    isLoading: groupsLoading,
    isError: groupsError,
    error: getGroupsError,
    refetch: refetchGroups,
  } = useGetGroups();

  const {
    data: bookingRequestsData = {} as PaginatedResponse<BookingRequest>,
    isLoading: bookingRequestsLoading,
    isError: bookingRequestsError,
    error: bookingRequestsGetError,
    refetch: refetchBookingRequests,
  } = useGetBookingRequests(
    pageIndex, 
    10, 
    activeView === 'bookings' ? debouncedSearchQuery : undefined
  );

  const approveBookingMutation = useApproveBookingRequest();
  const rejectBookingMutation = useRejectBookingRequest();
  const cancelBookingMutation = useCancelBookingRequest();

  const searchGroups = useCallback((groups: GroupData[], query: string) => {
    if (!query || !query.trim()) return groups;
    
    const searchTerm = query.toLowerCase().trim();
    return groups.filter((group) => {
      const name = safeToString(group?.name);
      const description = safeToString(group?.description);
      const location = safeToString(group?.location);

      return (
        name.includes(searchTerm) ||
        description.includes(searchTerm) ||
        location.includes(searchTerm)
      );
    });
  }, []);

  const filteredData = useMemo(() => {
    try {
      if (activeView === 'clients') {
        // For clients, we use server-side search, so return the data as-is
        return Array.isArray(allClients) ? allClients : [];
      } else if (activeView === 'groups') {
        const groupsData = Array.isArray(allGroups) ? allGroups : [];
        return debouncedSearchQuery.trim() ? searchGroups(groupsData, debouncedSearchQuery) : groupsData;
      } else if (activeView === 'bookings') {
        // For bookings, we use server-side search, so return the data as-is
        return Array.isArray(bookingRequestsData?.items) ? bookingRequestsData.items : [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error in filteredData:', error);
      if (activeView === 'clients') {
        return allClients || [];
      } else if (activeView === 'groups') {
        return allGroups || [];
      } else {
        return bookingRequestsData?.items || [];
      }
    }
  }, [activeView, allClients, allGroups, bookingRequestsData?.items, debouncedSearchQuery, searchGroups]);

  const clients = activeView === 'clients' ? filteredData as Client[] : allClients;
  const groups = activeView === 'groups' ? filteredData as GroupData[] : allGroups;
  // For bookings, always use the server-side filtered data
  const bookingRequests: BookingRequest[] = bookingRequestsData?.items || [];

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setRowSelection({});
  }, []);

  const handleViewChange = useCallback((view: 'clients' | 'groups' | 'bookings') => {
    setActiveView(view);
    setSearchQuery('');
    setRowSelection({});
  }, []);

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportClients(clients);

  const {
    exportModalOpened: groupExportModalOpened,
    openExportModal: openGroupExportModal,
    closeExportModal: closeGroupExportModal,
    handleExport: handleGroupExport,
    isExporting: groupIsExporting,
  } = useExportGroups(groups || []);

  const columns: ColumnDef<Client, any>[] = useMemo(
    () => [
      clientColumnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type='checkbox'
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
        cell: ({ row }) => (
          <input
            type='checkbox'
            checked={row.getIsSelected()}
            onClick={(e) => e.stopPropagation()}
            onChange={row.getToggleSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
      }),
      clientColumnHelper.accessor(
        (row) => {
          const firstName = row.first_name?.trim() || '';
          const lastName = row.last_name?.trim() || '';
          const fullName = `${firstName} ${lastName}`.trim();
          return fullName || 'Unnamed Client';
        },
        {
          id: 'name',
          header: 'Name',
          cell: (info) => (
            <div className='flex flex-col'>
              <span className='text-sm text-primary'>{info.getValue()}</span>
              <span className='text-xs text-[#8A8D8E]'>
                {info.row.original.id}
              </span>
            </div>
          ),
        }
      ),
      clientColumnHelper.accessor('phone_number', {
        header: 'Phone',
        cell: (info) => info.getValue() || '-',
      }),
      clientColumnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue() || '-',
      }),
      clientColumnHelper.accessor('active', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[70px] ${
              info.getValue()
                ? 'bg-active text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {info.getValue() ? 'Active' : 'Inactive'}
          </span>
        ),
      }),
      clientColumnHelper.accessor('source', {
        header: 'Source',
        cell: (info) => (
          <ClientSourceBadge source={info.getValue()} />
        ),
      }),
      clientColumnHelper.display({
        id: 'progress',
        header: 'Progress',
        cell: () => (
          <Progress color='#A6EECB' size='sm' radius='xl' value={50} />
        ),
      }),
      clientColumnHelper.display({
        id: 'actions',
        header: () => (
          <div className='flex space-x-2' onClick={(e) => e.stopPropagation()}>
            <Group justify='center'>
              <Menu
                width={150}
                shadow='md'
                position='bottom'
                radius='md'
                withArrow
                offset={4}
              >
                <Menu.Target>
                  <img
                    src={actionOptionIcon}
                    alt='Options'
                    className='w-4 h-4 cursor-pointer'
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color='#162F3B'
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                    onClick={openExportModal}
                  >
                    Export Clients
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>
        ),
        cell: (info) => {
          const client = info.row.original;
          return (
            <div
              className='flex space-x-2'
              onClick={(e) => e.stopPropagation()}
            >
              <Group justify='center'>
                <Menu
                  width={150}
                  shadow='md'
                  position='bottom'
                  radius='md'
                  withArrow
                  offset={4}
                >
                  <Menu.Target>
                    <img
                      src={actionOptionIcon}
                      alt='Options'
                      className='w-4 h-4 cursor-pointer'
                    />
                  </Menu.Target>
                  <Menu.Dropdown>
                    {client.active ? (
                      <Menu.Item
                        color='red'
                        onClick={() => {
                          setSelectedClient(client);
                          setIsActivating(false);
                          open();
                        }}
                        className='text-sm'
                        style={{ textAlign: 'center' }}
                      >
                        Deactivate
                      </Menu.Item>
                    ) : (
                      <Menu.Item
                        color='green'
                        onClick={() => {
                          setSelectedClient(client);
                          setIsActivating(true);
                          open();
                        }}
                        className='text-sm'
                        style={{ textAlign: 'center' }}
                      >
                        Activate
                      </Menu.Item>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </div>
          );
        },
      }),
    ],
    [setSelectedClient, open, openExportModal]
  );

  const groupColumns: ColumnDef<GroupData, any>[] = useMemo(
    () => [
      groupColumnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type='checkbox'
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
        cell: ({ row }) => (
          <input
            type='checkbox'
            checked={row.getIsSelected()}
            onClick={(e) => e.stopPropagation()}
            onChange={row.getToggleSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
      }),
      groupColumnHelper.accessor('name', {
        id: 'name',
        header: 'Name',
        cell: (info) => info.getValue(),
      }),
      groupColumnHelper.accessor('description', {
        id: 'description',
        header: 'Description',
        cell: (info) => info.getValue(),
      }),
      groupColumnHelper.accessor('location', {
        id: 'location',
        header: 'Location',
        cell: (info) => info.getValue(),
      }),
      groupColumnHelper.accessor(
        (row) => row.contact_person,
        {
          id: 'contact_person',
          header: 'Contact Person',
          cell: (info) => {
            const contactPerson = info.getValue();
            if (contactPerson && contactPerson.first_name && contactPerson.last_name) {
              return `${contactPerson.first_name} ${contactPerson.last_name}`;
            }
            return 'N/A';
          },
        }
      ),
      groupColumnHelper.accessor('active', {
        id: 'active',
        header: 'Status', 
        cell: (
          info 
        ) => (
          <span
            className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[70px] ${
              info.getValue()
                ? 'bg-active text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {info.getValue() ? 'Active' : 'Inactive'}
          </span>
        ),
      }),
      groupColumnHelper.accessor('source', {
        header: 'Source',
        cell: (info) => (
          <ClientSourceBadge source={info.getValue()} />
        ),
      }),
      groupColumnHelper.display({
        id: 'actions',
        header: () => (
          <div className='flex space-x-2' onClick={(e) => e.stopPropagation()}>
            <Group justify='center'>
              <Menu
                width={150}
                shadow='md'
                position='bottom'
                radius='md'
                withArrow
                offset={4}
              >
                <Menu.Target>
                  <img
                    src={actionOptionIcon}
                    alt='Options'
                    className='w-4 h-4 cursor-pointer'
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color='#162F3B'
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                    onClick={openGroupExportModal}
                  >
                    Export Groups
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>
        ),
        cell: (info) => (
          <div className='flex space-x-2' onClick={(e) => e.stopPropagation()}>
            <Group justify='center'>
              <Menu
                width={150}
                shadow='md'
                position='bottom'
                radius='md'
                withArrow
                offset={4}
              >
                <Menu.Target>
                  <img
                    src={actionOptionIcon}
                    alt='Options'
                    className='w-4 h-4 cursor-pointer'
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color='red'
                    onClick={() => {
                      setSelectedClient(info.row.original);
                      setIsActivating(false);
                      open();
                    }}
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                  >
                    Deactivate
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>
        ),
      }),
    ],
    [openGroupExportModal, open]
  );

  const handleDeactivateEntity = () => {
    if (!selectedClient) return;
    

    const mutation = activeView === 'clients' ? deactivateClientMutation : null; // Replace null with deactivateGroupMutation
    const entityId = selectedClient.id?.toString();
    const entityType = activeView === 'clients' ? 'Client' : 'Group';

    if (!mutation) {
      notifications.show({
        title: 'Error',
        message: `Deactivation for ${entityType}s not implemented.`,
        color: 'red',
      });
      close();
      return;
    }

    mutation.mutate(entityId!, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: `${entityType} deactivated successfully!`,
          color: 'green',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
        close();
        if (activeView === 'clients') refetch();
        else refetchGroups();
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: `Failed to deactivate ${entityType}. Please try again.`,
          color: 'red',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
      },
    });
  };

  const handleActivateEntity = () => {
    if (!selectedClient) return;
    
    const mutation = activeView === 'clients' ? activateClientMutation : null; // Replace null with activateGroupMutation
    const entityId = selectedClient.id?.toString();
    const entityType = activeView === 'clients' ? 'Client' : 'Group';

    if (!mutation) {
      notifications.show({
        title: 'Error',
        message: `Activation for ${entityType}s not implemented.`,
        color: 'red',
      });
      close();
      return;
    }
    mutation.mutate(entityId!, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: `${entityType} activated successfully!`,
          color: 'green',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
        close();
        if (activeView === 'clients') refetch();
        else refetchGroups();
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: `Failed to activate ${entityType}. Please try again.`,
          color: 'red',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
      },
    });
  };

  const handleOpenClientDrawer = () => {
    openDrawer({
      type: 'client',
      isEditing: false
    });
  };

  const isLoadingCurrent = activeView === 'clients' ? isLoading : activeView === 'groups' ? groupsLoading : bookingRequestsLoading;
  const isErrorCurrent = activeView === 'clients' ? isError : activeView === 'groups' ? groupsError : bookingRequestsError;
  const errorCurrent = activeView === 'clients' ? error : activeView === 'groups' ? getGroupsError : bookingRequestsGetError;
  const refetchCurrent = activeView === 'clients' ? refetch : activeView === 'groups' ? refetchGroups : refetchBookingRequests;

  const handleApproveBooking = async (requestId: number) => {
    try {
      await approveBookingMutation.mutateAsync(requestId);
      notifications.show({
        title: 'Success',
        message: 'Booking request approved successfully',
        color: 'green',
      });
      refetchBookingRequests();
      refetch(); // Refresh clients list as new client may have been created
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };

  const handleRejectBooking = async (requestId: number, reason?: string) => {
    try {
      await rejectBookingMutation.mutateAsync({ requestId, reason });
      notifications.show({
        title: 'Success',
        message: 'Booking request rejected',
        color: 'orange',
      });
      refetchBookingRequests();
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  const handleCancelBooking = async (requestId: number, reason?: string) => {
    try {
      await cancelBookingMutation.mutateAsync({ requestId, reason });
      notifications.show({
        title: 'Success',
        message: 'Booking request cancelled',
        color: 'orange',
      });
      refetchBookingRequests();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  if (isLoadingCurrent) {
    return (
      <ErrorBoundary>
        <div className='flex justify-center items-center h-screen p-6 pt-12'>
          <Loader size='xl' color='#1D9B5E' />
        </div>
      </ErrorBoundary>
    );
  }

  if (isErrorCurrent) {
    return (
      <ErrorBoundary>
        <div className='w-full space-y-6 bg-white rounded-lg p-6'>
          <div className='space-y-4'>
            <p className='text-red-500'>
              Error loading {activeView}: {errorCurrent?.message}
            </p>
            <button
              onClick={() => refetchCurrent()}
              className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90'
            >
              Try Again
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <MembersHeader
          title={activeView === 'clients' ? 'All Clients' : activeView === 'groups' ? 'All Groups' : 'Client Booking Requests'}
          buttonText={activeView === 'clients' ? 'Add Client' : activeView === 'groups' ? 'Add Group' : 'Manage Bookings'}
          searchPlaceholder={
            activeView === 'clients'
              ? 'Search by Name, Email or Phone Number'
              : activeView === 'groups'
              ? 'Search by Group Name or Description'
              : 'Search booking requests by client name or email'
          }
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          leftIcon={plusIcon}
          onButtonClick={handleOpenClientDrawer }
          showButton={permisions?.can_create_clients}
        />
        <div className='px-6 pt-4 pb-2'>
          <Group>
            <MantineButton
              variant={activeView === 'clients' ? 'filled' : 'outline'}
              onClick={() => handleViewChange('clients')}
              color={activeView === 'clients' ? '#1D9B5E' : '#1D9B5E'}
            >
              Clients
            </MantineButton>
            <MantineButton
              variant={activeView === 'groups' ? 'filled' : 'outline'}
              onClick={() => handleViewChange('groups')}
              color={activeView === 'groups' ? '#1D9B5E' : '#1D9B5E'}
            >
              Groups
            </MantineButton>
            <MantineButton
              variant={activeView === 'bookings' ? 'filled' : 'outline'}
              onClick={() => handleViewChange('bookings')}
              color={activeView === 'bookings' ? '#1D9B5E' : '#1D9B5E'}
            >
              Client Bookings
            </MantineButton>
          </Group>
        </div>
        <EmptyDataPage
          title={
            searchQuery.trim()
              ? `No ${activeView === 'clients' ? 'Clients' : activeView === 'groups' ? 'Groups' : 'Booking Requests'} Found`
              : activeView === 'clients' ? 'No Clients Found' : activeView === 'groups' ? 'No Groups Found' : 'No Booking Requests Found'
          }
          description={
            debouncedSearchQuery.trim()
              ? `No ${activeView === 'clients' ? 'clients' : activeView === 'groups' ? 'groups' : 'booking requests'} match your search "${debouncedSearchQuery}"`
              : activeView === 'clients'
              ? "You don't have any clients yet"
              : activeView === 'groups'
              ? "You don't have any groups yet"
              : "No booking requests at this time. Client booking requests will appear here when submitted through your booking links."
          }
          buttonText={
            searchQuery.trim()
              ? 'Clear Search'
              : activeView === 'clients' ? 'Add New Client' : activeView === 'groups' ? 'Add New Group' : 'Manage Booking Settings'
          }
          onButtonClick={searchQuery.trim() ? () => setSearchQuery('') : handleOpenClientDrawer}
          onClose={() => {}}
          opened={
            (activeView === 'clients'
              ? clients.length === 0
              : activeView === 'groups'
              ? groups.length === 0
              : bookingRequests.length === 0) && !isLoadingCurrent
          }
          showButton={Boolean(searchQuery.trim()) || Boolean(permisions?.can_create_clients)}
        />
        <div className='flex-1 px-6 py-3'>
          {activeView === 'clients' && clients.length > 0 && (
            <Table<Client>
              data={clients}
              columns={columns}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              className='mt-4'
              pageSize={12}
              onRowClick={(row: Client) => {
                  navigateToClientDetails(navigate, row.id.toString());
              }}
              paginateServerSide={true}
              pageIndex={pageIndex}
              pageCount={data.totalPages}
              onPageChange={setPageIndex}
            />
          )}
          {activeView === 'groups' && groups.length > 0 && (
            <Table<GroupData>
              data={groups}
              columns={groupColumns}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              className='mt-4'
              pageSize={12}
              onRowClick={(row: GroupData) => {
                if (row.id) { 
                  navigateToGroupDetails(navigate, row.id.toString());
                }
              }}
            />
          )}
          {activeView === 'bookings' && (
            <BookingRequestsTable
              data={bookingRequests}
              onApprove={handleApproveBooking}
              onReject={handleRejectBooking}
              onCancel={handleCancelBooking}
              isLoading={bookingRequestsLoading}
            />
          )}
        </div>
      </div>

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={600} size='lg'>
            {isActivating
              ? `Activate ${activeView === 'clients' ? 'Client' : 'Group'}`
              : `Deactivate ${activeView === 'clients' ? 'Client' : 'Group'}`}
          </Text>
        }
        centered
        radius='md'
        size='md'
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        shadow='xl'
      >
        <div className='flex items-start space-x-4 mb-6'>
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${
              isActivating ? 'bg-green-100' : 'bg-red-100'
            } flex items-center justify-center`}
          >
            <img
              src={isActivating ? successIcon : errorIcon}
              alt='Warning'
              className='w-5 h-5'
            />
          </div>
          <div>
            <Text fw={500} size='md' mb={8} c='gray.8'>
              Are you sure you want to{' '}
              {isActivating ? 'activate' : 'deactivate'} this{' '}
              {activeView === 'clients' ? 'client' : 'group'}?
            </Text>
            <Text size='sm' c='gray.6'>
              {isActivating
                ? `This action will make the ${
                    activeView === 'clients' ? 'client' : 'group'
                  } active in the system. They will appear in active ${
                    activeView === 'clients' ? 'client' : 'group'
                  } lists.`
                : `This action will make the ${
                    activeView === 'clients' ? 'client' : 'group'
                  } inactive in the system. They will no longer appear in active ${
                    activeView === 'clients' ? 'client' : 'group'
                  } lists.`}
            </Text>
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <MantineButton
            color={isActivating ? 'green' : 'red'}
            onClick={
              isActivating ? handleActivateEntity : handleDeactivateEntity
            }
            loading={
              (isActivating &&
                activeView === 'clients' &&
                activateClientMutation.isPending) ||
              (!isActivating &&
                activeView === 'clients' &&
                deactivateClientMutation.isPending)
            }
            radius='md'
          >
            {isActivating ? 'Activate' : 'Deactivate'}
          </MantineButton>
        </div>
      </Modal>

      <Modal
        opened={exportModalOpened || groupExportModalOpened}
        onClose={activeView === 'clients' ? closeExportModal : closeGroupExportModal}
        title={
          <Text fw={600} size='lg'>
            Export {activeView === 'clients' ? 'Clients' : 'Groups'}
          </Text>
        }
        centered
        radius='md'
        size='md'
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        shadow='xl'
      >
        <div className='py-2'>
          <Text size='sm' style={{ marginBottom: '2rem' }}>
            Select the format to export your{' '}
            {activeView === 'clients' ? 'clients' : 'groups'}. The export will
            include all currently filtered{' '}
            {activeView === 'clients' ? 'clients' : 'groups'} or selected{' '}
            {activeView === 'clients' ? 'clients' : 'groups'} if any. Number of
            selected {activeView === 'clients' ? 'clients' : 'groups'}:{' '}
            {Object.keys(rowSelection).length > 0
              ? Object.keys(rowSelection).length
              : 'All'}
          </Text>
          <Group gap="sm" style={{ marginTop: "2rem" }}>
            <MantineButton
              color="#1D9B5E"
              onClick={() => activeView === 'clients' ? handleExport('csv', Object.keys(rowSelection).map(Number)) : handleGroupExport('csv', Object.keys(rowSelection).map(Number))}
              loading={activeView === 'clients' ? isExporting : groupIsExporting}
              radius="md"
            >
              CSV Export
            </MantineButton>
            <MantineButton
              color="#1D9B5E"
              variant="outline"
              onClick={() => activeView === 'clients' ? handleExport('excel', Object.keys(rowSelection).map(Number)) : handleGroupExport('excel', Object.keys(rowSelection).map(Number))}
              loading={activeView === 'clients' ? isExporting : groupIsExporting}
              radius="md"
            >
              Excel Export
            </MantineButton>
          </Group>
        </div>
      </Modal>
    </ErrorBoundary>
  );
};

export default AllClients;