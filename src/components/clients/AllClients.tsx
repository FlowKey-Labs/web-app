import MembersHeader from '../headers/MembersHeader';
import plusIcon from '../../assets/icons/plusWhite.svg';
import { Client, clientsData } from '../utils/dummyData';
import Table from '../common/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { Progress } from '@mantine/core';

import actioEyeIcon from '../../assets/icons/actionEye.svg';
import actionEditIcon from '../../assets/icons/actionEdit.svg';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import { useState } from 'react';
import ClientsModal from './ClientsModal';
import { useNavigate } from 'react-router-dom';
import { navigateToClientDetails } from '../utils/navigationHelpers';

const columnHelper = createColumnHelper<(typeof clientsData)[0]>();

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
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('session', {
    header: 'Session',
    cell: (info) => info.getValue().join(', '),
  }),
  columnHelper.accessor('phone', {
    header: 'Phone',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span
        className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[70px] ${
          info.getValue() === 'active'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'progress',
    header: 'Progress',
    cell: () => <Progress color='#FFAE0080' size='sm' radius='xl' value={50} />,
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <div className='flex space-x-2'>
        <img src={actioEyeIcon} alt='View' className='w-4 h-4 cursor-pointer' />
        <img
          src={actionEditIcon}
          alt='Edit'
          className='w-4 h-4 cursor-pointer'
        />
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <MembersHeader
          title='All Clients'
          buttonText='New Client'
          searchPlaceholder='Search by ID, Name or Subject'
          leftIcon={plusIcon}
          onButtonClick={openModal}
        />
        <div className='flex-1 px-6 py-3'>
          <Table
            data={clientsData}
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
      <ClientsModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default AllClients;
