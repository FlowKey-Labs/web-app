import MembersHeader from '../headers/MembersHeader';
import plusIcon from '../../assets/icons/plusWhite.svg';
import { Client, GroupData } from '../../types/clientTypes';
import Table from '../common/Table';
import {
  useGetClients,
  useDeactivateClient,
  useActivateClient,
  useGetGroups,
} from '../../hooks/reactQuery';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import {
  Progress,
  Group,
  Modal,
  Text,
  Button as MantineButton,
  Menu,
  Stack,
  Loader,
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
import {
  navigateToClientDetails,
  navigateToGroupDetails,
} from '../../utils/navigationHelpers';
import { safeToString } from '../../utils/stringUtils';
import EmptyDataPage from '../common/EmptyDataPage';
import { useAuthStore } from '../../store/auth';
import { useUIStore } from '../../store/ui';
import ErrorBoundary from '../common/ErrorBoundary';
import { PaginatedResponse } from '../../api/api';

const clientColumnHelper = createColumnHelper<Client>();
const groupColumnHelper = createColumnHelper<GroupData>();

const AllClients = () => {
  const [pageIndex, setPageIndex] = useState(1);

  const [rowSelection, setRowSelection] = useState({});
  const [selectedClient, setSelectedClient] = useState<
    Client | GroupData | null
  >(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activeView, setActiveView] = useState<'clients' | 'groups'>('clients');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showEmptyState, setShowEmptyState] = useState(true);

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
  } = useGetClients(pageIndex, 10);

  const allClients = useMemo(() => data.items, [data]);

  const {
    data: allGroups = [],
    isLoading: groupsLoading,
    isError: groupsError,
    error: getGroupsError,
    refetch: refetchGroups,
  } = useGetGroups();

  const searchClients = useCallback((clients: Client[], query: string) => {
    if (!query.trim()) return clients;

    try {
      const searchTerms = query.toLowerCase().trim().split(/\s+/);

      return clients.filter((client) => {
        try {
          const searchableFields = [
            `${safeToString(client.first_name)} ${safeToString(
              client.last_name
            )}`.trim(),
            safeToString(client.first_name),
            safeToString(client.last_name),
            safeToString(client.email),
            safeToString(client.phone_number),
            safeToString(client.location),
            safeToString(client.id),
          ].filter((field) => field.length > 0);

          const combinedText = searchableFields.join(' ');

          return searchTerms.every((term) => combinedText.includes(term));
        } catch (error) {
          console.warn('Error processing client in search:', client.id, error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in searchClients:', error);
      return clients;
    }
  }, []);

  const searchGroups = useCallback((groups: GroupData[], query: string) => {
    if (!query.trim()) return groups;

    try {
      const searchTerms = query.toLowerCase().trim().split(/\s+/);

      return groups.filter((group) => {
        try {
          const searchableFields = [
            safeToString(group.name),
            safeToString(group.description),
            safeToString(group.location),
            safeToString(group.contact_person?.first_name),
            safeToString(group.contact_person?.last_name),
            group.contact_person
              ? `${safeToString(
                  group.contact_person.first_name
                )} ${safeToString(group.contact_person.last_name)}`.trim()
              : '',
            safeToString(group.id),
          ].filter((field) => field.length > 0);

          const combinedText = searchableFields.join(' ');

          return searchTerms.every((term) => combinedText.includes(term));
        } catch (error) {
          console.warn('Error processing group in search:', group.id, error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in searchGroups:', error);
      return groups;
    }
  }, []);

  const filteredData = useMemo(() => {
    try {
      if (activeView === 'clients') {
        const clientsData = Array.isArray(allClients) ? allClients : [];
        return debouncedSearchQuery.trim()
          ? searchClients(clientsData, debouncedSearchQuery)
          : clientsData;
      } else {
        const groupsData = Array.isArray(allGroups) ? allGroups : [];
        return debouncedSearchQuery.trim()
          ? searchGroups(groupsData, debouncedSearchQuery)
          : groupsData;
      }
    } catch (error) {
      console.error('Error in filteredData:', error);
      return activeView === 'clients' ? allClients || [] : allGroups || [];
    }
  }, [
    activeView,
    allClients,
    allGroups,
    debouncedSearchQuery,
    searchClients,
    searchGroups,
  ]);

  const clients =
    activeView === 'clients' ? (filteredData as Client[]) : allClients;
  const groups =
    activeView === 'groups' ? (filteredData as GroupData[]) : allGroups;

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setRowSelection({});
  }, []);

  const handleViewChange = useCallback((view: 'clients' | 'groups') => {
    setActiveView(view);
    setSearchQuery('');
    setRowSelection({});
  }, []);

  const getSelectedIds = useCallback((): number[] => {
    const currentData = filteredData;
    if (!currentData) return [];

    return Object.keys(rowSelection)
      .map((index) => {
        const itemIndex = parseInt(index);
        const item = currentData[itemIndex];
        return item?.id;
      })
      .filter((id): id is number => id !== undefined);
  }, [rowSelection, filteredData]);

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportClients(clients || []);

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
        (row) => `${row.first_name} ${row.last_name}`,
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
      }),
      clientColumnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue(),
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
      groupColumnHelper.accessor((row) => row.contact_person, {
        id: 'contact_person',
        header: 'Contact Person',
        cell: (info) => {
          const contactPerson = info.getValue();
          if (
            contactPerson &&
            contactPerson.first_name &&
            contactPerson.last_name
          ) {
            return `${contactPerson.first_name} ${contactPerson.last_name}`;
          }
          return 'N/A';
        },
      }),
      groupColumnHelper.accessor('active', {
        id: 'active',
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
    // TODO: Add deactivateGroupMutation if groups can be deactivated

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
    // TODO: Add activateGroupMutation if groups can be activated
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
      onError: (_error: unknown) => {
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
      isEditing: false,
    });
  };

  const isLoadingCurrent = activeView === 'clients' ? isLoading : groupsLoading;
  const isErrorCurrent = activeView === 'clients' ? isError : groupsError;
  const errorCurrent = activeView === 'clients' ? error : getGroupsError;
  const refetchCurrent = activeView === 'clients' ? refetch : refetchGroups;

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
          title={activeView === 'clients' ? 'All Clients' : 'All Groups'}
          buttonText={activeView === 'clients' ? 'Add Client' : 'Add Group'}
          searchPlaceholder={
            activeView === 'clients'
              ? 'Search by Name, Email or Phone Number'
              : 'Search by Group Name or Description'
          }
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          leftIcon={plusIcon}
          onButtonClick={handleOpenClientDrawer}
          showButton={permisions?.can_create_clients}
        />
        <div className='px-6 pt-4 mt-10 md:mt-0'>
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
          </Group>
        </div>
        <EmptyDataPage
          title={
            searchQuery.trim()
              ? `No ${activeView === 'clients' ? 'Clients' : 'Groups'} Found`
              : activeView === 'clients'
              ? 'No Clients Found'
              : 'No Groups Found'
          }
          description={
            debouncedSearchQuery.trim()
              ? `No ${
                  activeView === 'clients' ? 'clients' : 'groups'
                } match your search "${debouncedSearchQuery}"`
              : activeView === 'clients'
              ? "You don't have any clients yet"
              : "You don't have any groups yet"
          }
          buttonText={
            searchQuery.trim()
              ? 'Clear Search'
              : activeView === 'clients'
              ? 'Add New Client'
              : 'Add New Group'
          }
          onButtonClick={
            searchQuery.trim()
              ? () => setSearchQuery('')
              : handleOpenClientDrawer
          }
          onClose={() => setShowEmptyState(false)}
          opened={
            showEmptyState &&
            (activeView === 'clients'
              ? clients.length === 0
              : groups.length === 0) &&
            !isLoadingCurrent
          }
          showButton={
            Boolean(searchQuery.trim()) ||
            Boolean(permisions?.can_create_clients)
          }
        />
        <div className='flex-1 px-2 md:px-6 md:py-3 pt-4 w-full overflow-x-auto'>
          <div className='min-w-[900px] md:min-w-0'>
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
          </div>
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
        onClose={
          activeView === 'clients' ? closeExportModal : closeGroupExportModal
        }
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
              : `All ${
                  activeView === 'clients' ? clients.length : groups.length
                } (if none selected)`}
          </Text>

          <Stack gap='md'>
            <MantineButton
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() =>
                activeView === 'clients'
                  ? handleExport('excel', getSelectedIds())
                  : handleGroupExport('excel', getSelectedIds())
              }
              className='px-6'
              loading={
                activeView === 'clients' ? isExporting : groupIsExporting
              }
              disabled={
                activeView === 'clients' ? isExporting : groupIsExporting
              }
            >
              Export as Excel (.xlsx)
            </MantineButton>

            <MantineButton
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() =>
                activeView === 'clients'
                  ? handleExport('csv', getSelectedIds())
                  : handleGroupExport('csv', getSelectedIds())
              }
              className='px-6'
              loading={
                activeView === 'clients' ? isExporting : groupIsExporting
              }
              disabled={
                activeView === 'clients' ? isExporting : groupIsExporting
              }
            >
              Export as CSV (.csv)
            </MantineButton>
          </Stack>

          <div className='flex justify-end space-x-4 mt-8'>
            <MantineButton
              variant='outline'
              color='red'
              radius='md'
              onClick={
                activeView === 'clients'
                  ? closeExportModal
                  : closeGroupExportModal
              }
              className='px-6'
            >
              Cancel
            </MantineButton>
          </div>
        </div>
      </Modal>
    </ErrorBoundary>
  );
};

export default AllClients;
