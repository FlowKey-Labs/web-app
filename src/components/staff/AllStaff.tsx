import MembersHeader from '../headers/MembersHeader';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import actioEyeIcon from '../../assets/icons/actionEye.svg';
import actionEditIcon from '../../assets/icons/actionEdit.svg';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import Table from '../common/Table';
import { data, Staff } from '../utils/dummyData';
import plusIcon from '../../assets/icons/plusWhite.svg';
import StaffModal from './StaffModal';
import { navigateToStaffDetails } from '../utils/navigationHelpers';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<Staff>();

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
    cell: (info) => (
      <div className='flex items-center'>
        <img
          src={info.row.original.profileImage}
          alt='Profile'
          className='w-8 h-8 rounded-full mr-3'
        />
        <div className='text-start'>
          <p className='font-medium text-gray-900'>{info.getValue()}</p>
          <p className='text-xs text-gray-500'>
            {info.row.original.staffNumber}
          </p>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'Phone Number',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span
        className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[70px] ${
          info.getValue() === 'Active'
            ? 'bg-active text-primary'
            : 'bg-red-100 text-red-800'
        }`}
      >
        
        {info.getValue()}
      </span>
    ),
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

const AllStaff = () => {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <MembersHeader
          title='All Staff'
          buttonText='New Staff'
          searchPlaceholder='Search by ID, Name or Subject'
          leftIcon={plusIcon}
          onButtonClick={openModal}
        />
        <div className='flex-1 px-6 py-3'>
          <Table
            data={data}
            columns={columns}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            className='mt-4'
            pageSize={8}
            onRowClick={(row: Staff) =>
              navigateToStaffDetails(navigate, row.id.toString())
            }
          />
        </div>
      </div>
      <StaffModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default AllStaff;
