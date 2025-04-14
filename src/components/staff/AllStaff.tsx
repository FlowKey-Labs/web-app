import MembersHeader from '../headers/MembersHeader';
import { createColumnHelper } from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import Table from '../common/Table';
import plusIcon from '../../assets/icons/plusWhite.svg';
import { navigateToStaffDetails } from '../../utils/navigationHelpers';
import { useNavigate } from 'react-router-dom';
import { useGetStaff } from '../../hooks/reactQuery';
import { StaffResponse } from '../../types/staffTypes';
import AddStaff from './AddStaff';
import EmptyDataPage from '../common/EmptyDataPage';
import { Group, Menu, Modal, Text, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

const columnHelper = createColumnHelper<StaffResponse>();

const useExportStaff = () => {
  const [exportModalOpened, { open: openExportModal, close: closeExportModal }] = useDisclosure(false);
  
  const handleExport = (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      notifications.show({
        title: 'No staff selected',
        message: 'Please select at least one staff member to export',
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
      closeExportModal();
      return;
    }
    
    notifications.show({
      title: 'Export successful',
      message: `${selectedIds.length} staff member(s) exported successfully`,
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
    
    closeExportModal();
  };
  
  return { exportModalOpened, openExportModal, closeExportModal, handleExport };
}

const AllStaff = () => {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const { exportModalOpened, openExportModal, closeExportModal, handleExport } = useExportStaff();
  
  const {
    data: staff = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStaff();

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  
  const columns = useMemo(() => [
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
      cell: () => (
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
    }),
  ], [openExportModal]);
  

  if (isLoading) {
    return (
      <div className='w-full min-h-screen space-y-6 bg-white rounded-lg p-6'>
        <p className='text-primary'>Loading staff...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='w-full min-h-screen space-y-6 bg-white rounded-lg p-6'>
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
          searchPlaceholder='Search by ID, Name or Email'
          leftIcon={plusIcon}
          onButtonClick={openDrawer}
        />
        <EmptyDataPage
          title='No Staff Found'
          description="You don't have any staff members yet"
          buttonText='Add New Staff'
          onButtonClick={openDrawer}
          onClose={() => {}}
          opened={staff.length === 0 && !isLoading}
        />
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
      </div>
      <AddStaff isOpen={isDrawerOpen} onClose={closeDrawer} />
      
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
          <Text size='sm' className='mb-6'>
            Are you sure you want to export the selected staff members?
          </Text>
          <div className='flex justify-end space-x-4 mt-8'>
            <Button
              variant='outline'
              color='#EA0234'
              radius='md'
              onClick={closeExportModal}
              className='px-6'
            >
              Cancel
            </Button>
            <Button
              color='#1D9B5E'
              radius='md'
              onClick={() => handleExport(Object.keys(rowSelection))}
              className='px-6'
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AllStaff;
