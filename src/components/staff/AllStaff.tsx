import MembersHeader from '../headers/MembersHeader';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import Table from '../common/Table';
import plusIcon from '../../assets/icons/plusWhite.svg';
import { navigateToStaffDetails } from '../../utils/navigationHelpers';
import { useNavigate } from 'react-router-dom';
import { useGetStaff } from '../../hooks/reactQuery';
import { StaffResponse } from '../../types/staffTypes';
import AddStaff from './AddStaff';

const columnHelper = createColumnHelper<StaffResponse>();

const columns = [
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
      <img
        src={actionOptionIcon}
        alt='Options'
        className='w-4 h-4 cursor-pointer'
      />
    ),
    cell: () => (
      <div className='flex space-x-2' onClick={(e) => e.stopPropagation()}>
        <img
          src={actionOptionIcon}
          alt='Options'
          className='w-4 h-4 cursor-pointer'
        />
      </div>
    ),
  }),
];

const AllStaff = () => {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: staff = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStaff();

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

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
    </>
  );
};

export default AllStaff;
