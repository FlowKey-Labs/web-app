import MembersHeader from '../headers/MembersHeader';
import { createColumnHelper } from '@tanstack/react-table';
import { useState, useMemo, useCallback } from 'react';
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
import AddStaff from './AddStaff';
import EmptyDataPage from '../common/EmptyDataPage';
import {
  Group,
  Menu,
  Modal,
  Text,
  Button as MantineButton,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { useExportStaff } from '../../hooks/useExport';
import { navigateToStaffDetails } from '../../utils/navigationHelpers';

const columnHelper = createColumnHelper<StaffResponse>();

const AllStaff = () => {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffResponse | null>(
    null
  );
  const [isActivating, setIsActivating] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const {
    data: staff = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStaff();

  const activateStaffMutation = useActivateStaff();
  const deactivateStaffMutation = useDeactivateStaff();

  const getSelectedStaffIds = useCallback(() => {
    if (!staff) return [];

    return Object.keys(rowSelection).map((index) => {
      const staffIndex = parseInt(index);
      return staff[staffIndex].id;
    });
  }, [rowSelection, staff]);

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportStaff(staff || []);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleDeactivateStaff = () => {
    if (!selectedStaff) return;

    deactivateStaffMutation.mutate(selectedStaff.id.toString(), {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Staff member deactivated successfully!',
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
      },
      onError: (_error: unknown) => {
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
      },
    });
  };

  const handleActivateStaff = () => {
    if (!selectedStaff) return;

    activateStaffMutation.mutate(selectedStaff.id.toString(), {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Staff member activated successfully!',
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
      },
      onError: (_error: unknown) => {
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
      },
    });
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
    [navigate, staff, open]
  );

  if (isLoading) {
    return (
      <div className='w-full space-y-6 bg-white rounded-lg p-6'>
        <p className='text-primary'>Loading staff...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='w-full space-y-6 bg-white rounded-lg p-6'>
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

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <MembersHeader
          title='All Staff'
          buttonText='New Staff'
          searchPlaceholder='Search by Name, Email or Phone Number'
          leftIcon={plusIcon}
          onButtonClick={openDrawer}
        />
        {!isDrawerOpen && (
          <EmptyDataPage
            title='No Staff Found'
            description="You don't have any staff yet"
            buttonText='Add New Staff'
            onButtonClick={openDrawer}
            onClose={() => {}}
            opened={staff.length === 0 && !isLoading && !isError}
          />
        )}
        {staff.length > 0 && (
          <div className='flex-1 px-6 py-3'>
            <Table
              data={staff}
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

      <AddStaff isOpen={isDrawerOpen} onClose={closeDrawer} />

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
            color={isActivating ? 'green' : 'red'}
            onClick={isActivating ? handleActivateStaff : handleDeactivateStaff}
            loading={
              isActivating
                ? activateStaffMutation.isPending
                : deactivateStaffMutation.isPending
            }
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
