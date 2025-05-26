import MembersHeader from '../headers/MembersHeader';
import { createColumnHelper } from '@tanstack/react-table';
import { useState, useMemo, useCallback, useEffect } from 'react';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import Table from '../common/Table';
import plusIcon from '../../assets/icons/plusWhite.svg';
import { useNavigate } from 'react-router-dom';
import {
  useGetStaff,
  useActivateStaff,
  useDeactivateStaff,
} from '../../hooks/reactQuery';
import { StaffResponse } from '../../types/staffTypes';
import EmptyDataPage from '../common/EmptyDataPage';
import {
  Group,
  Menu,
  Modal,
  Text,
  Button as MantineButton,
  Stack,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { useExportStaff } from '../../hooks/useExport';
import { navigateToStaffDetails } from '../../utils/navigationHelpers';
import { useAuthStore } from '../../store/auth';
import { useUIStore } from '../../store/ui';

const columnHelper = createColumnHelper<StaffResponse>();

const AllStaff = () => {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState({});
  const [selectedStaff, setSelectedStaff] = useState<StaffResponse | null>(
    null
  );
  const [isActivating, setIsActivating] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [activationLoading, setActivationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const permisions = useAuthStore((state) => state.role);
  const { openDrawer } = useUIStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: staff = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStaff();

  const activateStaffMutation = useActivateStaff();
  const deactivateStaffMutation = useDeactivateStaff();

  const filteredStaff = useMemo(() => {
    if (!staff || staff.length === 0) return [];
    
    if (!debouncedSearchQuery.trim()) {
      return staff;
    }

    const searchLower = debouncedSearchQuery.toLowerCase().trim();
    
    return staff.filter((staffMember) => {
      const fullName = `${staffMember.user?.first_name || ''} ${staffMember.user?.last_name || ''}`.toLowerCase();
      
      const email = (staffMember.user?.email || '').toLowerCase();
      
      const phone = (staffMember.user?.mobile_number || '').toLowerCase();
      
      const memberId = (staffMember.member_id || '').toLowerCase();
      
      const role = (staffMember.role || '').toLowerCase();

      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        memberId.includes(searchLower) ||
        role.includes(searchLower)
      );
    });
  }, [staff, debouncedSearchQuery]);

  const getSelectedStaffIds = useCallback(() => {
    if (!filteredStaff) return [];

    return Object.keys(rowSelection).map((index) => {
      const staffIndex = parseInt(index);
      return filteredStaff[staffIndex].id;
    });
  }, [rowSelection, filteredStaff]);

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportStaff(filteredStaff || []);

  const handleOpenStaffDrawer = () => {
    openDrawer({
      type: 'staff',
      isEditing: false
    });
  };

  const handleActivateDeactivateStaff = () => {
    setActivationLoading(true);
    if (selectedStaff) {
      if (isActivating) {
        activateStaffMutation.mutate(
          selectedStaff.id.toString(),
          {
            onSuccess: () => {
              notifications.show({
                title: 'Success',
                message: 'Staff activated successfully!',
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
              refetch();
              setActivationLoading(false);
            },
            onError: () => {
              notifications.show({
                title: 'Error',
                message: 'Failed to activate staff member. Please try again.',
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
              setActivationLoading(false);
            },
          }
        );
      } else {
        deactivateStaffMutation.mutate(
          selectedStaff.id.toString(),
          {
            onSuccess: () => {
              notifications.show({
                title: 'Success',
                message: 'Staff deactivated successfully!',
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
              refetch();
              setActivationLoading(false);
            },
            onError: () => {
              notifications.show({
                title: 'Error',
                message: 'Failed to deactivate staff member. Please try again.',
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
              setActivationLoading(false);
            },
          }
        );
      }
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
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
      columnHelper.accessor(
        (row) => `${row.user.first_name} ${row.user.last_name}`,
        {
          header: 'Name',
          cell: (info) => (
            <div className='text-start'>
              <p className='text-sm text-primary'>{info.getValue()}</p>
              <p className='text-xs text-[#8A8D8E]'>
                {info.row.original.member_id}
              </p>
            </div>
          ),
        }
      ),
      columnHelper.accessor((row) => row.user.mobile_number, {
        header: 'Phone Number',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.user.email, {
        header: 'Email',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[70px] ${
              info.getValue() === true
                ? 'bg-active text-primary'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {info.getValue() === true ? 'Active' : 'Inactive'}
          </span>
        ),
      }),
      columnHelper.display({
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
                    Export Staff
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>
        ),
        cell: (info) => {
          const currentStaff = info.row.original;

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
                    {currentStaff.isActive ? (
                      <Menu.Item
                        color='red'
                        onClick={() => {
                          setSelectedStaff(currentStaff);
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
                          setSelectedStaff(currentStaff);
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
    [navigate, filteredStaff, open]
  );

  useEffect(() => {
    setRowSelection({});
  }, [debouncedSearchQuery]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader color='#1D9B5E' size='xl' />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='space-y-4'>
          <p className='text-red-500'>Error loading staff: {error?.message}</p>
          <button
            onClick={() => refetch()}
            className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasSearchResults = Boolean(debouncedSearchQuery.trim()) && filteredStaff.length > 0;
  const hasNoSearchResults = Boolean(debouncedSearchQuery.trim()) && filteredStaff.length === 0;
  const hasNoStaff = !debouncedSearchQuery.trim() && staff.length === 0;

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <MembersHeader
          title='All Staff'
          buttonText='New Staff'
          searchPlaceholder='Search by Name, Email, Phone, or Role'
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          leftIcon={plusIcon}
          onButtonClick={handleOpenStaffDrawer}
          showButton={permisions?.can_create_staff}
        />
        
        <EmptyDataPage
          title={hasNoSearchResults ? 'No Staff Found' : 'No Staff Found'}
          description={
            hasNoSearchResults 
              ? `No staff members match "${debouncedSearchQuery}". Try different search terms.`
              : "You don't have any staff yet"
          }
          buttonText='Add New Staff'
          onButtonClick={handleOpenStaffDrawer}
          onClose={() => {
            if (hasNoSearchResults) {
              setSearchQuery('');
            }
          }}
          opened={(hasNoStaff || hasNoSearchResults) && !isLoading && !isError}
          showButton={permisions?.can_create_staff}
        />
        
        {hasSearchResults && (
          <div className='px-6 py-2'>
            <Text size='sm' color='dimmed'>
              Found {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''} matching "{debouncedSearchQuery}"
            </Text>
          </div>
        )}
        
        {(filteredStaff.length > 0) && (
          <div className='flex-1 px-6 py-3'>
            <Table
              data={filteredStaff}
              columns={columns}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              className='mt-4'
              pageSize={8}
              onRowClick={(row: StaffResponse) =>
                navigateToStaffDetails(navigate, row.id.toString())
              }
            />
          </div>
        )}
      </div>

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={600} size='lg'>
            {isActivating ? 'Activate Staff Member' : 'Deactivate Staff Member'}
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
              {isActivating ? 'activate' : 'deactivate'} this staff member?
            </Text>
            <Text size='sm' c='gray.6'>
              {isActivating
                ? 'This action will make the staff member active in the system. They will appear in active staff lists.'
                : 'This action will make the staff member inactive in the system. They will no longer appear in active staff lists.'}
            </Text>
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <MantineButton
            variant='outline'
            color='gray'
            radius='md'
            onClick={close}
            disabled={activationLoading}
          >
            Cancel
          </MantineButton>
          <MantineButton
            color={isActivating ? 'green' : 'red'}
            onClick={handleActivateDeactivateStaff}
            loading={activationLoading}
            disabled={activationLoading}
            radius='md'
          >
            {isActivating ? 'Activate' : 'Deactivate'}
          </MantineButton>
        </div>
      </Modal>

      <Modal
        opened={exportModalOpened}
        onClose={closeExportModal}
        title={
          <Text fw={600} size='lg'>
            Export Staff
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
            Select a format to export {Object.keys(rowSelection).length}{' '}
            selected staff members
          </Text>

          <Stack gap='md'>
            <MantineButton
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => handleExport('excel', getSelectedStaffIds())}
              className='px-6'
              loading={isExporting}
            >
              Export as Excel
            </MantineButton>

            <MantineButton
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => handleExport('csv', getSelectedStaffIds())}
              className='px-6'
              loading={isExporting}
            >
              Export as CSV
            </MantineButton>
          </Stack>

          <div className='flex justify-end space-x-4 mt-8'>
            <MantineButton
              variant='outline'
              color='red'
              radius='md'
              onClick={closeExportModal}
              className='px-6'
            >
              Cancel
            </MantineButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AllStaff;
