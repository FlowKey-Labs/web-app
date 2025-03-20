import { useParams } from 'react-router-dom';
import { classesData, clientsData } from '../utils/dummyData';
import MembersHeader from '../headers/MembersHeader';
import { Progress } from '@mantine/core';
import rightIcon from '../../assets/icons/greenRight.svg';
import plusIcon from '../../assets/icons/plusWhite.svg';
import { useMemo, useState } from 'react';
import ClassesModal from './ClassesModal';
import Table from '../common/Table';
import { createColumnHelper } from '@tanstack/react-table';

import actioEyeIcon from '../../assets/icons/actionEye.svg';
import actionEditIcon from '../../assets/icons/actionEdit.svg';
import actionOptionIcon from '../../assets/icons/actionOption.svg';

const ClassDetails = () => {
  const { id } = useParams();
  const classId = id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients'>(
    'overview'
  );
  const [rowSelection, setRowSelection] = useState({});

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const classDetails = useMemo(() => {
    return classesData.find((c) => c.id.toString() === classId);
  }, [classId]);

  if (!classDetails) {
    return (
      <div className='p-8'>
        <h2 className='text-[40px] font-bold text-primary'>Class not found</h2>
      </div>
    );
  }

  const columnHelper = createColumnHelper<(typeof clientsData)[0]>();

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
          className={`px-2 py-1 rounded-full text-sm ${
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
      cell: () => (
        <Progress color='#FFAE0080' size='sm' radius='xl' value={50} />
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className='flex space-x-2'>
          <img
            src={actioEyeIcon}
            alt='View'
            className='w-4 h-4 cursor-pointer'
          />
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

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto '>
        <MembersHeader
          title=''
          buttonText='New Class'
          searchPlaceholder='Search by ID, Name or Subject'
          leftIcon={plusIcon}
          onButtonClick={openModal}
          showFilterIcons={false}
        />
        <div className='items-center gap-4 p-6'>
          <div className='space-y-2 pl-10'>
            <p className='text-gray-500 text-sm'>Classes/Class Details</p>
            <p className='text-lg font-semibold'>
              {classDetails.class} <span>({classDetails.classLevel})</span>
            </p>
          </div>
          <div className='flex w-full'>
            <div className='flex flex-col w-[30%] items-center mt-6'>
              <div className='flex flex-col px-4 py-8 items-center justify-center border rounded-xl w-[290px]'>
                <img
                  src={classDetails.profileImage}
                  alt='Profile'
                  className='w-12 h-12 rounded-full'
                />
                <div className='mt-2 text-center space-y-1'>
                  <p className='font-medium text-gray-900 text-sm'>
                    {classDetails.class}{' '}
                    <span>({classDetails.classLevel})</span>
                  </p>
                  <p className='text-sm text-gray-500'>
                    {classDetails.classType}
                  </p>
                </div>
                <div className='flex space-x-6 mt-2'>
                  <div className='rounded-full bg-[#F2F2F2] py-2 px-4'>
                    <p className='text-xs'>Season 2.1</p>
                  </div>
                  <div className='rounded-full bg-[#F2F2F2] py-2 px-4'>
                    <p className='text-xs'>Active</p>
                  </div>
                </div>
                <div className='h-[1px] bg-gray-300 w-full my-6'></div>
                <div className='w-full px-4 space-y-4'>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      CLASS ID
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {classDetails.class}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      SLOTS
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {classDetails.slots}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      CALENDER
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {classDetails.repeats.join(', ')}
                    </span>
                  </div>
                </div>
                <div className='h-[1px] bg-gray-300 w-[80%] mx-auto my-6'></div>
                <div className='w-full px-4 space-y-4'>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      DATE CREATED
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {classDetails.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      END DATE
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {classDetails.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      ASSIGNED TO
                    </span>
                    <span className='text-gray-500  text-xs'>
                      {classDetails.AssignedTo}
                    </span>
                  </div>
                </div>
                <div className='h-[1px] bg-gray-300 w-full my-6'></div>
                <div className='w-full pb-6'>
                  <div className='flex justify-between text-xs pb-2'>
                    <p className=''>Learning Progress</p>
                    <p className=''>50%</p>
                  </div>

                  <Progress
                    color='#FFAE0080'
                    size='md'
                    radius='xl'
                    value={50}
                  />
                </div>
              </div>
            </div>
            <div className=' w-[70%] p-4'>
              <div className='space-y-4'>
                <div className='flex space-x-12 ml-8 relative' role='tablist'>
                  <button
                    role='tab'
                    aria-selected={activeTab === 'overview'}
                    aria-controls='overview-panel'
                    className={`font-bold text-xl pb-3 relative cursor-pointer transition-all duration-200 hover:text-gray-700  ${
                      activeTab === 'overview'
                        ? 'text-primary'
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overall View
                    <div
                      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-[2px] transition-all duration-200 ease-in-out ${
                        activeTab === 'overview'
                          ? 'bg-secondary scale-100'
                          : 'bg-transparent scale-0'
                      }`}
                    />
                  </button>
                </div>
                <div className='h-[1px] bg-gray-300 w-full opacity-60'></div>
              </div>
              <div className='flex space-x-16 mt-6'>
                <div className='flex flex-col items-center border rounded-xl p-6  space-y-4'>
                  <p className='text-4xl'>
                    3<span className='text-lg text-gray-500'>/12</span>
                  </p>
                  <p className='text-sm'>Total Clients</p>
                </div>
                <div className='flex items-center border py-6 px-10 rounded-xl'>
                  <div className='flex flex-col items-center rounded-xl  space-y-4'>
                    <p className='text-4xl'>
                      14<span className='text-lg text-gray-500'>/44</span>
                    </p>
                    <p className='text-sm'>Sessions</p>
                  </div>
                </div>
                <div className='flex items-center border py-6 px-10 rounded-xl'>
                  <div className='flex flex-col items-center rounded-xl  space-y-4'>
                    <p className='text-2xl font-semibold  test-primary'>93%</p>
                    <p className='text-sm'>Average Attendance</p>
                  </div>
                </div>
              </div>
              <div className='flex-1 mt-6'>
                <div className=''>
                  <div className='flex justify-between'>
                    <h3 className='text-primary text-xl font-semibold'>
                      Clients
                    </h3>
                    <div className='flex item-center justify-center gap-2 cursor-pointer'>
                      <h3 className='text-secondary font-medium'>View All</h3>
                      <img
                        src={rightIcon}
                        alt='right side icon'
                        className='w-6 h-6'
                      />
                    </div>
                  </div>
                  <div className='flex-1 py-2'>
                    <Table
                      data={clientsData}
                      columns={columns}
                      rowSelection={rowSelection}
                      onRowSelectionChange={setRowSelection}
                      className='mt-4'
                      pageSize={5}
                    />
                  </div>{' '}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ClassesModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default ClassDetails;
