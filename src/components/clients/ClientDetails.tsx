import { useParams } from 'react-router-dom';
import MembersHeader from '../headers/MembersHeader';
import { Progress } from '@mantine/core';
import rightIcon from '../../assets/icons/greenRight.svg';
import plusIcon from '../../assets/icons/plusWhite.svg';
import { useMemo, useState } from 'react';
import Table from '../common/Table';
import { createColumnHelper } from '@tanstack/react-table';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import { useGetClient } from '../../hooks/reactQuery';
import { paymentHistories } from '../../utils/dummyData';
import avatar from '../../assets/icons/newAvatar.svg';
import UpdateClient from './UpdateClient';

const ClientDetails = () => {
  const { id: clientId } = useParams();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients'>(
    'overview'
  );
  const [rowSelection, setRowSelection] = useState({});

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const {
    data: clientDetails,
    isLoading,
    isError,
    error,
  } = useGetClient(clientId || '');

  const paymentHistory = useMemo(() => {
    return paymentHistories.filter((c) => c.clientId.toString() === clientId);
  }, [clientId]);

  const columnHelper = createColumnHelper<(typeof paymentHistories)[0]>();

  const columns = [
    columnHelper.accessor('class', {
      header: 'Class',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('package', {
      header: 'Package',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) =>
        info
          .getValue()
          .toLocaleString('en-US', { style: 'currency', currency: 'KES' }),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span
          className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[70px] ${
            info.getValue() === 'paid'
              ? 'bg-active text-secondary'
              : 'bg-[#FFCFCC] text-[#FF3B30]'
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('transactionId', {
      header: 'Transaction ID',
      cell: (info) => info.getValue(),
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

  if (isLoading) {
    return (
      <div className='w-full space-y-6 bg-white rounded-lg p-6'>
        <p className='text-primary'>Loading client details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='w-full space-y-6 bg-white rounded-lg p-6'>
        <div className='space-y-4'>
          <p className='text-red-500'>
            Error loading client details: {error?.message}
          </p>
        </div>
      </div>
    );
  }

  if (!clientDetails) {
    return (
      <div className='w-full min-h-screen space-y-6 bg-white rounded-lg p-6'>
        <p className='text-primary'>Client not found</p>
      </div>
    );
  }

  if (!paymentHistory) {
    return (
      <div className='p-8 min-h-screen'>
        <h2 className='text-[40px] font-bold text-primary'>
          Payment history not found
        </h2>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto '>
        <MembersHeader
          title='Client Details'
          buttonText='Update Client'
          searchPlaceholder='Search by ID, Name or Subject'
          onButtonClick={openDrawer}
          showFilterIcons={false}
        />
        <div className='items-center gap-4 p-6'>
          <div className='flex w-full'>
            <div className='flex flex-col w-[30%] items-center mt-6'>
              <div className='flex flex-col px-4 py-8 items-center justify-center border bg-white rounded-xl w-[290px]'>
                <img
                  src={clientDetails.profileImage || avatar}
                  alt='Profile'
                  className='w-12 h-12 rounded-full'
                />
                <div className='mt-2 text-center space-y-1'>
                  <p className='font-medium text-gray-900 text-sm'>
                    {`${clientDetails.first_name} ${clientDetails.last_name}`}
                  </p>
                  <p className='text-sm text-gray-500'>{clientDetails.email}</p>
                </div>
                <div className='flex space-x-2 mt-4'>
                  <div 
                    className={`flex justify-center items-center py-1.5 px-3 rounded-full gap-1.5 ${clientDetails.active ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${clientDetails.active ? 'bg-secondary animate-pulse' : 'bg-red-500'}`}></div>
                    <p
                      className={`text-xs font-medium ${clientDetails.active ? 'text-green-700' : 'text-red-700'}`}
                    >
                      {clientDetails.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className='h-[1px] bg-gray-300 w-full my-6'></div>
                <div className='w-full px-4 space-y-4'>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      CLIENT ID
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {clientDetails.id || 'N/A'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      SESSIONS
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {clientDetails.assigned_classes || 0}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      CATEGORY
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {clientDetails.classCategory || 'N/A'}
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
                      {new Date(clientDetails.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      ASSIGNED TO
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {clientDetails.assignedTo || 'Not Assigned'}
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
                    className={`font-bold text-xl relative cursor-pointer transition-all duration-200 hover:text-gray-700  ${
                      activeTab === 'overview'
                        ? 'text-primary'
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overall View
                  </button>
                </div>
                <div className='h-[1px] bg-gray-300 w-full opacity-60'></div>
              </div>
              <div className='flex space-x-16 mt-6'>
                <div className='flex items-center border py-6 px-10 bg-white rounded-xl'>
                  <div className='flex flex-col items-center rounded-xl  space-y-4'>
                    <p className='text-4xl'>
                      14<span className='text-lg text-gray-500'>/44</span>
                    </p>
                    <p className='text-sm'>Sessions</p>
                  </div>
                </div>
                <div className='flex items-center border py-6 px-10 bg-white rounded-xl'>
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
                      Payment History
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
                      data={paymentHistory}
                      columns={columns}
                      rowSelection={rowSelection}
                      onRowSelectionChange={setRowSelection}
                      className='mt-4'
                      pageSize={5}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UpdateClient
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        clientId={clientId}
      />
    </>
  );
};

export default ClientDetails;
