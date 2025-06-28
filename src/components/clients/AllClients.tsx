import MembersHeader from '../headers/MembersHeader';
import plusIcon from '../../assets/icons/plusWhite.svg';
import usersIcon from '../../assets/icons/users.svg';
import totalClientsIcon from '../../assets/icons/totalClients.svg';
import emptyIcon from '../../assets/icons/empty.svg';
import ActivityIndicator from '../common/ActivityIndicator';
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
  Stack,
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
import { useAuthStore } from '../../store/auth';
import { useUIStore } from '../../store/ui';
import ErrorBoundary from '../common/ErrorBoundary';
import { PaginatedResponse } from '../../api/api';

// Enhanced Empty State Component
const EmptyStateCard = ({ 
  title, 
  description, 
  icon, 
  buttonText, 
  onButtonClick, 
  showButton = true 
}: {
  title: string;
  description: string;
  icon: string;
  buttonText?: string;
  onButtonClick?: () => void;
  showButton?: boolean;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-lg border-2 border-dashed border-gray-200 mx-6 my-4">
    <div className="relative mb-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
        <img src={icon} alt="" className="w-8 h-8 opacity-60" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 rounded-full animate-pulse" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 text-center max-w-sm mb-6">{description}</p>
    {showButton && onButtonClick && (
      <MantineButton
        color="#1D9B5E"
        radius="md"
        size="md"
        onClick={onButtonClick}
        className="shadow-sm hover:shadow-md transition-shadow"
      >
        {buttonText}
      </MantineButton>
    )}
  </div>
);

// Enhanced Tab Button Component
const TabButton = ({ 
  active, 
  onClick, 
  children, 
  hasActivity 
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hasActivity?: boolean;
}) => (
  <div className="relative">
    <MantineButton
      variant={active ? 'filled' : 'outline'}
      onClick={onClick}
      color="#1D9B5E"
      size="sm"
    >
      {children}
    </MantineButton>
    <ActivityIndicator
      visible={Boolean(hasActivity) && !active}
      color="#ef4444"
      size={10}
      top="-4px"
      right="-4px"
      animation="glow"
      animationDuration={2}
      showBorder={true}
      borderColor="#ffffff"
      zIndex={60}
    />
  </div>
);

const clientColumnHelper = createColumnHelper<Client>();
const groupColumnHelper = createColumnHelper<GroupData>();

const AllClients = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedClient, setSelectedClient] = useState<Client | GroupData | null>(null); 
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

  // Booking requests data
  const {
    data: bookingRequestsData,
    isLoading: bookingRequestsLoading,
    isError: bookingRequestsError,
    error: bookingRequestsApiError,
    refetch: refetchBookingRequests,
  } = useGetBookingRequests(1, 10, activeView === 'bookings' ? debouncedSearchQuery : undefined);

  const approveBookingMutation = useApproveBookingRequest();
  const rejectBookingMutation = useRejectBookingRequest();
  const cancelBookingMutation = useCancelBookingRequest();

  // Count pending booking requests for badge
  const pendingBookingCount = useMemo(() => {
    if (!bookingRequestsData?.items) return 0;
    const count = bookingRequestsData.items.filter((booking: BookingRequest) => booking.status === 'pending').length;
    console.log('Pending booking count:', count, 'Total bookings:', bookingRequestsData.items.length);
    return count;
  }, [bookingRequestsData?.items]);

  const handleApproveBooking = useCallback(async (requestId: number) => {
    try {
      await approveBookingMutation.mutateAsync(requestId);
      // Success notification and refetch handled by mutation
    } catch (error) {
      // Error notification handled by mutation
    }
  }, [approveBookingMutation]);

  const handleRejectBooking = useCallback(async (requestId: number, reason?: string) => {
    try {
      await rejectBookingMutation.mutateAsync({ requestId, reason: reason || '' });
      // Success notification and refetch handled by mutation
    } catch (error) {
      // Error notification handled by mutation
    }
  }, [rejectBookingMutation]);

  const handleCancelBooking = useCallback(async (requestId: number, reason?: string) => {
    try {
      await cancelBookingMutation.mutateAsync({ requestId, reason: reason || '' });
      // Success notification and refetch handled by mutation
    } catch (error) {
      // Error notification handled by mutation
    }
  }, [cancelBookingMutation]);

  const searchGroups = useCallback((groups: GroupData[], query: string) => {
    if (!query.trim()) return groups;
    
    const lowercaseQuery = query.toLowerCase();
    return groups.filter((group) => {
      const name = safeToString(group.name).toLowerCase();
      const description = safeToString(group.description).toLowerCase();
      return name.includes(lowercaseQuery) || description.includes(lowercaseQuery);
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
    isExporting: isExportingGroups,
  } = useExportGroups(groups);

  // Client source badge component
  const ClientSourceBadge = ({ source }: { source: ClientSource }) => {
    const getSourceConfig = (source: ClientSource) => {
      switch (source) {
        case 'manual':
          return { color: 'blue', label: 'Manual' };
        case 'booking_link':
          return { color: 'green', label: 'Booking Link' };
        default:
          return { color: 'gray', label: 'Unknown' };
      }
    };

    const config = getSourceConfig(source);
    return (
      <Badge color={config.color} variant="light" size="sm">
        {config.label}
      </Badge>
    );
  };

  const columns: ColumnDef<Client, any>[] = useMemo(
    () => [
      clientColumnHelper.accessor('first_name', {
        header: 'Name',
        cell: (info) => {
          const firstName = safeToString(info.getValue());
          const lastName = safeToString(info.row.original.last_name);
          return `${firstName} ${lastName}`.trim() || 'N/A';
        },
      }),
      clientColumnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => safeToString(info.getValue()) || 'N/A',
      }),
      clientColumnHelper.accessor('phone_number', {
        header: 'Phone Number',
        cell: (info) => safeToString(info.getValue()) || 'N/A',
      }),
      clientColumnHelper.accessor('location', {
        header: 'Location',
        cell: (info) => safeToString(info.getValue()) || 'N/A',
      }),
      clientColumnHelper.accessor('assigned_classes', {
        header: 'Sessions',
        cell: (info) => info.getValue() || 0,
      }),
      clientColumnHelper.accessor('active', {
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
      clientColumnHelper.accessor('source', {
        header: 'Source',
        cell: (info) => (
          <ClientSourceBadge source={info.getValue()} />
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
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className='flex space-x-2 items-center' onClick={(e) => e.stopPropagation()}>
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
                    onClick={() => {
                      setSelectedClient(client);
                      setIsActivating(!client.active);
                      open();
                    }}
                  >
                    {client.active ? 'Deactivate' : 'Activate'}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          );
        },
      }),
    ],
    [openExportModal, open]
  );

  const groupColumns: ColumnDef<GroupData, any>[] = useMemo(
    () => [
      groupColumnHelper.accessor('name', {
        header: 'Group Name',
        cell: (info) => safeToString(info.getValue()) || 'N/A',
      }),
      groupColumnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => {
          const description = safeToString(info.getValue());
          return description.length > 50 
            ? `${description.substring(0, 50)}...`
            : description || 'N/A';
        },
      }),
      groupColumnHelper.accessor('location', {
        header: 'Location',
        cell: (info) => safeToString(info.getValue()) || 'N/A',
      }),
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
        cell: () => (
          <div className='flex space-x-2 items-center' onClick={(e) => e.stopPropagation()}>
            {/* Add group-specific actions here if needed */}
          </div>
        ),
      }),
    ],
    [openGroupExportModal]
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
  const errorCurrent = activeView === 'clients' ? error : activeView === 'groups' ? getGroupsError : bookingRequestsApiError;
  const refetchCurrent = activeView === 'clients' ? refetch : activeView === 'groups' ? refetchGroups : refetchBookingRequests;

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
          buttonText={activeView === 'clients' ? 'Add Client' : activeView === 'groups' ? 'Add Group' : undefined}
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
          onButtonClick={activeView !== 'bookings' ? handleOpenClientDrawer : undefined}
          showButton={activeView !== 'bookings' && permisions?.can_create_clients}
        />
        
        {/* Enhanced Tab Navigation */}
        <div className='px-6 pt-4 pb-2'>
          <Group>
            <TabButton
              active={activeView === 'clients'}
              onClick={() => handleViewChange('clients')}
            >
              Clients
            </TabButton>
            <TabButton
              active={activeView === 'groups'}
              onClick={() => handleViewChange('groups')}
            >
              Groups
            </TabButton>
            <TabButton
              active={activeView === 'bookings'}
              onClick={() => handleViewChange('bookings')}
              hasActivity={pendingBookingCount > 0}
            >
              Client Bookings
            </TabButton>
          </Group>
        </div>

        <div className='flex-1 px-6 py-3'>
          {isLoadingCurrent ? (
            <div className='flex justify-center items-center py-16'>
              <Loader color='#1D9B5E' size='xl' />
            </div>
          ) : (
            <>
              {/* Clients View */}
              {activeView === 'clients' && (
                <>
                  {clients.length > 0 ? (
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
                  ) : (
                    <EmptyStateCard
                      title={searchQuery.trim() ? "No Clients Found" : "No Clients Yet"}
                      description={
                        searchQuery.trim()
                          ? `No clients match your search "${searchQuery}". Try different search terms or add a new client.`
                          : "You haven't added any clients yet. Clients will appear here once you start adding them to your system."
                      }
                      icon={usersIcon}
                      buttonText={searchQuery.trim() ? "Clear Search" : "Add Your First Client"}
                      onButtonClick={searchQuery.trim() ? () => setSearchQuery('') : handleOpenClientDrawer}
                      showButton={Boolean(searchQuery.trim()) || Boolean(permisions?.can_create_clients)}
                    />
                  )}
                </>
              )}

              {/* Groups View */}
              {activeView === 'groups' && (
                <>
                  {groups.length > 0 ? (
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
                  ) : (
                    <EmptyStateCard
                      title={searchQuery.trim() ? "No Groups Found" : "No Groups Yet"}
                      description={
                        searchQuery.trim()
                          ? `No groups match your search "${searchQuery}". Try different search terms or create a new group.`
                          : "You haven't created any client groups yet. Groups help you organize and manage multiple clients together."
                      }
                      icon={totalClientsIcon}
                      buttonText={searchQuery.trim() ? "Clear Search" : "Create Your First Group"}
                      onButtonClick={searchQuery.trim() ? () => setSearchQuery('') : handleOpenClientDrawer}
                      showButton={Boolean(searchQuery.trim()) || Boolean(permisions?.can_create_clients)}
                    />
                  )}
                </>
              )}

              {/* Bookings View */}
              {activeView === 'bookings' && (
                <>
                  {bookingRequests.length > 0 ? (
                    <BookingRequestsTable
                      data={bookingRequests}
                      onApprove={handleApproveBooking}
                      onReject={handleRejectBooking}
                      onCancel={handleCancelBooking}
                      isLoading={bookingRequestsLoading}
                    />
                  ) : (
                    <EmptyStateCard
                      title={searchQuery.trim() ? "No Booking Requests Found" : "No Booking Requests"}
                      description={
                        searchQuery.trim()
                          ? `No booking requests match your search "${searchQuery}". Try different search terms.`
                          : "No client booking requests at this time. Booking requests from clients will appear here when they book through your public booking links."
                      }
                      icon={emptyIcon}
                      buttonText={searchQuery.trim() ? "Clear Search" : undefined}
                      onButtonClick={searchQuery.trim() ? () => setSearchQuery('') : undefined}
                      showButton={Boolean(searchQuery.trim())}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Confirmation Modal */}
        <Modal
          opened={opened}
          onClose={close}
          title={`${isActivating ? 'Activate' : 'Deactivate'} ${activeView === 'clients' ? 'Client' : 'Group'}`}
          centered
        >
          <Stack>
            <Text>
              Are you sure you want to {isActivating ? 'activate' : 'deactivate'} this{' '}
              {activeView === 'clients' ? 'client' : 'group'}?
            </Text>
            <Group justify='flex-end'>
              <MantineButton variant='outline' onClick={close}>
                Cancel
              </MantineButton>
              <MantineButton
                color={isActivating ? 'green' : 'red'}
                onClick={isActivating ? handleActivateEntity : handleDeactivateEntity}
              >
                {isActivating ? 'Activate' : 'Deactivate'}
              </MantineButton>
            </Group>
          </Stack>
        </Modal>

        {/* Export Modals */}
        <Modal
          opened={exportModalOpened}
          onClose={closeExportModal}
          title='Export Clients'
          centered
        >
          <Stack>
            <Text size='sm'>
              Export all client data to CSV format for backup or analysis.
            </Text>
            <Group justify='flex-end'>
              <MantineButton variant='outline' onClick={closeExportModal}>
                Cancel
              </MantineButton>
              <MantineButton
                onClick={() => handleExport('csv', Object.keys(rowSelection).map(Number))}
                loading={isExporting}
                color='green'
              >
                Export
              </MantineButton>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={groupExportModalOpened}
          onClose={closeGroupExportModal}
          title='Export Groups'
          centered
        >
          <Stack>
            <Text size='sm'>
              Export all group data to CSV format for backup or analysis.
            </Text>
            <Group justify='flex-end'>
              <MantineButton variant='outline' onClick={closeGroupExportModal}>
                Cancel
              </MantineButton>
              <MantineButton
                onClick={() => handleGroupExport('csv', Object.keys(rowSelection).map(Number))}
                loading={isExportingGroups}
                color='green'
              >
                Export
              </MantineButton>
            </Group>
          </Stack>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default AllClients;