import MembersHeader from '../headers/MembersHeader';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import actioEyeIcon from '../../assets/icons/actionEye.svg';
import actionEditIcon from '../../assets/icons/actionEdit.svg';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import Avatar from '../../assets/images/avatar.png';
import Table from '../common/Table';

type Staff = {
  id: number;
  name: string;
  staffNumber: string;
  idNumber: number;
  phoneNumber: string;
  email: string;
  assignedClasses: string;
  status: 'Active' | 'Inactive';
  profileImage: string;
};

const data: Staff[] = [
  {
    id: 1,
    name: 'John Doe',
    staffNumber: 'SN001',
    idNumber: 366357,
    phoneNumber: '+1234567890',
    email: 'john.doe@example.com',
    assignedClasses: 'Math, Science',
    status: 'Active',
    profileImage: Avatar,
  },
  {
    id: 2,
    name: 'Jane Smith',
    staffNumber: 'SN002',
    idNumber: 366358,
    phoneNumber: '+1234567891',
    email: 'jane.smith@example.com',
    assignedClasses: 'English, History',
    status: 'Inactive',
    profileImage: Avatar,
  },
  {
    id: 3,
    name: 'Alice Johnson',
    staffNumber: 'SN003',
    idNumber: 366359,
    phoneNumber: '+1234567892',
    email: 'alice.johnson@example.com',
    assignedClasses: 'Physics, Chemistry',
    status: 'Active',
    profileImage: Avatar,
  },
  {
    id: 4,
    name: 'Bob Brown',
    staffNumber: 'SN004',
    idNumber: 366360,
    phoneNumber: '+1234567893',
    email: 'bob.brown@example.com',
    assignedClasses: 'Biology, Geography',
    status: 'Active',
    profileImage: Avatar,
  },
  {
    id: 5,
    name: 'Emma Wilson',
    staffNumber: 'SN005',
    idNumber: 366361,
    phoneNumber: '+1234567894',
    email: 'emma.wilson@example.com',
    assignedClasses: 'Art, Music',
    status: 'Active',
    profileImage: Avatar,
  },
  {
    id: 6,
    name: 'Michael Clark',
    staffNumber: 'SN006',
    idNumber: 366362,
    phoneNumber: '+1234567895',
    email: 'michael.clark@example.com',
    assignedClasses: 'Physical Education, Health',
    status: 'Inactive',
    profileImage: Avatar,
  },
  {
    id: 7,
    name: 'Sarah Davis',
    staffNumber: 'SN007',
    idNumber: 366363,
    phoneNumber: '+1234567896',
    email: 'sarah.davis@example.com',
    assignedClasses: 'Computer Science, Robotics',
    status: 'Active',
    profileImage: Avatar,
  },
  {
    id: 8,
    name: 'James Wilson',
    staffNumber: 'SN008',
    idNumber: 366364,
    phoneNumber: '+1234567897',
    email: 'james.wilson@example.com',
    assignedClasses: 'Literature, Drama',
    status: 'Active',
    profileImage: Avatar,
  },
];

const columnHelper = createColumnHelper<Staff>();

const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <input
        type='checkbox'
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#0F2028]'
      />
    ),
    cell: ({ row }) => (
      <input
        type='checkbox'
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#0F2028]'
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
  columnHelper.accessor('idNumber', {
    header: 'ID Number',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'Phone Number',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('assignedClasses', {
    header: 'Assigned Classes',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span
        className={`px-2 py-1 rounded-full text-sm font-[500] ${
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
  const [rowSelection, setRowSelection] = useState({});
  return (
    <div className='flex min-h-screen bg-[#0F2028]'>
      <div className='flex flex-col min-h-screen bg-white w-full rounded-l-[36px]'>
        <MembersHeader />
        <div className='flex-1 px-6'>
          <Table
            data={data}
            columns={columns}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            className='mt-4'
            pageSize={7}
          />
        </div>
      </div>
    </div>
  );
};

export default AllStaff;
