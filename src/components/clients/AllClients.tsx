import MembersHeader from '../headers/MembersHeader';
import plusIcon from '../../assets/icons/plusWhite.svg';
import { Client } from '../../types/clientTypes';
import Table from '../common/Table';
import { useGetClients } from '../../hooks/reactQuery';
import { createColumnHelper } from '@tanstack/react-table';
import { Progress } from '@mantine/core';

import actionOptionIcon from '../../assets/icons/actionOption.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateToClientDetails } from '../../utils/navigationHelpers';
import AddClients from './AddClient';

const columnHelper = createColumnHelper<Client>();

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
  columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
    id: 'name',
    header: 'Name',
    cell: (info) => (
      <div className='flex flex-col'>
        <span className='text-sm text-primary'>{info.getValue()}</span>
        <span className='text-xs text-[#8A8D8E]'>{info.row.original.id}</span>
      </div>
    ),
  }),
  columnHelper.accessor('phone_number', {
    header: 'Phone',
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('active', {
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
  columnHelper.display({
    id: 'progress',
    header: 'Progress',
    cell: () => <Progress color='#A6EECB' size='sm' radius='xl' value={50} />,
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

const AllClients = () => {
  const [rowSelection, setRowSelection] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const {
    data: clients = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetClients();

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  if (isLoading) {
    return (
      <div className='w-full space-y-6 bg-white rounded-lg p-6'>
        <p className='text-primary'>Loading clients...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='w-full space-y-6 bg-white rounded-lg p-6'>
        <div className='space-y-4'>
          <p className='text-red-500'>
            Error loading clients: {error?.message}
          </p>
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
          title='All Clients'
          buttonText='New Client'
          searchPlaceholder='Search by Name, Session or Phone'
          leftIcon={plusIcon}
          onButtonClick={openDrawer}
        />
        <div className='flex-1 px-6 py-3'>
          <Table
            data={clients}
            columns={columns}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            className='mt-4'
            pageSize={12}
            onRowClick={(row: Client) =>
              navigateToClientDetails(navigate, row.id.toString())
            }
          />
        </div>
      </div>
      <AddClients isOpen={isDrawerOpen} onClose={closeDrawer} />
    </>
  );
};

export default AllClients;
