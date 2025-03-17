import { useParams } from 'react-router-dom';
import { classesData } from '../utils/dummyData';
import MembersHeader from '../headers/MembersHeader';
import { Progress } from '@mantine/core';

import plusIcon from '../../assets/icons/plus.svg';
import { useState } from 'react';
import ClassesModal from './ClassesModal';

const ClassDetails = () => {
  const { id } = useParams();
  const classId = id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients'>(
    'overview'
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const classDetails = classesData.find((c) => c.id.toString() === classId);

  if (!classDetails) {
    return (
      <div className='p-8'>
        <h2 className='text-[40px] font-bold text-primary'>Class not found</h2>
      </div>
    );
  }

  return (
    <>
      <div className='flex min-h-screen bg-[#0F2028]'>
        <div className='flex flex-col min-h-screen bg-white w-full rounded-l-[36px]'>
          <MembersHeader
            title=''
            buttonText='New Class'
            searchPlaceholder='Search by ID, Name or Subject'
            buttonIcon={plusIcon}
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
                <div className='flex flex-col p-4 items-center justify-center border rounded-xl w-[290px]'>
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
                      color='#D9D9D9'
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
                            ? 'bg-flowkeySecondary scale-100'
                            : 'bg-transparent scale-0'
                        }`}
                      />
                    </button>
                    <button
                      role='tab'
                      aria-selected={activeTab === 'clients'}
                      aria-controls='clients-panel'
                      className={`font-bold text-xl pb-3 relative cursor-pointer transition-all duration-200 hover:text-gray-700  ${
                        activeTab === 'clients'
                          ? 'text-primary'
                          : 'text-gray-500'
                      }`}
                      onClick={() => setActiveTab('clients')}
                    >
                      Clients
                      <div
                        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-[2px] transition-all duration-200 ease-in-out ${
                          activeTab === 'clients'
                            ? 'bg-flowkeySecondary scale-100'
                            : 'bg-transparent scale-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className='h-[1px] bg-gray-300 w-full opacity-60'></div>
                </div>
                <div className='flex  mt-6 space-x-4'>
                  <div className='flex flex-col items-center border rounded-xl p-6  space-y-4'>
                    <p className='text-4xl'>
                      3<span className='text-lg'>/12</span>
                    </p>
                    <p className='text-sm'>Total Clients</p>
                  </div>
                  <div className='flex items-center border py-6 px-10 rounded-xl gap-10'>
                    <div className='flex flex-col items-center rounded-xl  space-y-4'>
                      <p className='text-xl font-medium  test-primary'>
                        8<span className=' text-gray-400'>/36</span>
                      </p>
                      <p className='text-sm'>Sessions</p>
                    </div>
                    <div className='w-[1px] bg-gray-300 h-full '></div>

                    <div className='flex flex-col items-center rounded-xl  space-y-4'>
                      <p className='text-xl font-medium  test-primary'>
                        8<span className=' text-gray-400'>/36</span>
                      </p>
                      <p className='text-sm'>Sessions</p>
                    </div>
                    <div className='w-[1px] bg-gray-300 h-full '></div>

                    <div className='flex flex-col items-center rounded-xl  space-y-4'>
                      <p className='text-xl font-medium  test-primary'>
                        8<span className=' text-gray-400'>/36</span>
                      </p>
                      <p className='text-sm'>Sessions</p>
                    </div>
                    <div className='w-[1px] bg-gray-300 h-full '></div>

                    <div className='flex flex-col items-center rounded-xl  space-y-4'>
                      <p className='text-xl font-medium  test-primary'>
                        8<span className=' text-gray-400'>/36</span>
                      </p>
                      <p className='text-sm'>Sessions</p>
                    </div>
                  </div>
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
