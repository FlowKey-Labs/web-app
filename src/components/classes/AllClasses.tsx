import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';

import MembersHeader from '../headers/MembersHeader';
import Table from '../common/Table';
import ClassesModal from './ClassesModal';
import { classesData, ClassData } from '../utils/dummyData';
import { navigateToClassDetails } from '../utils/navigationHelpers';

import actioEyeIcon from '../../assets/icons/actionEye.svg';
import actionEditIcon from '../../assets/icons/actionEdit.svg';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import plusIcon from '../../assets/icons/plusWhite.svg';
import classesFilterIcon from '../../assets/icons/classesFilter.svg';
import resetIcon from '../../assets/icons/resetIcon.svg';
import dropIcon from '../../assets/icons/dropIcon.svg';
import Modal from '../common/Modal';

const columnHelper = createColumnHelper<ClassData>();

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
  columnHelper.accessor('class', {
    header: 'Class',
    cell: (info) => (
      <div className='flex items-center'>
        <img
          src={info.row.original.profileImage}
          alt='Profile'
          className='w-8 h-8 rounded-full mr-3'
        />
        <div className='text-start'>
          <p className='font-medium text-gray-900 text-sm'>{info.getValue()}</p>
          <p className='text-xs text-gray-500'>
            {info.row.original.classLevel}
          </p>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor('AssignedTo', {
    header: 'Assigned to',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('classType', {
    header: 'Class Type',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('slots', {
    header: 'Slots',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) =>
      info.getValue().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
  }),
  columnHelper.accessor('duration', {
    header: 'Duration',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('repeats', {
    header: 'Repeats',
    cell: (info) => info.getValue().join(', '),
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

const AllClasses = () => {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClassTypeModalOpen, setIsClassTypeModalOpen] = useState(false);
  const [modalContentType, setModalContentType] = useState<
    'class' | 'appointment'
  >('class');


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className='flex min-h-screen bg-[#0F2028]'>
        <div className='flex flex-col min-h-screen bg-white w-full rounded-l-[36px]'>
          <MembersHeader
            title='Classes'
            buttonText='New Class'
            searchPlaceholder='Search by ID, Name or Subject'
            leftIcon={plusIcon}
            onButtonClick={openModal}
          />
          <div className='flex h-[70px] w-[70%]  ml-6 text-sm p-2 border rounded-md'>
            <div className='flex items-center justify-between w-full px-6 font-bold'>
              <div className='flex justify-center items-center'>
                <img
                  src={classesFilterIcon}
                  alt='filter section'
                  className='self-center'
                />
              </div>
              <div className='h-full w-[1px] bg-gray-200'></div>
              <div className=''>
                <p>Filter By</p>
              </div>
              <div className='h-full w-[1px] bg-gray-200'></div>

              <div className='flex items-center space-x-2 cursor-pointer'>
                <p>14 Feb 2025</p>
                <img src={dropIcon} alt='' />
              </div>
              <div className='h-full w-[1px] bg-gray-200'></div>

              <div
                className='flex items-center space-x-2 cursor-pointer'
                onClick={() => {
                  setModalContentType('class');
                  setIsClassTypeModalOpen(true);
                }}
              >
                <p>Class Type</p>
                <img src={dropIcon} alt='' />
              </div>
              <div className='h-full w-[1px] bg-gray-200'></div>

              <div
                className='flex items-center space-x-2 cursor-pointer'
                onClick={() => {
                  setModalContentType('appointment');
                  setIsClassTypeModalOpen(true);
                }}
              >
                <p>Category</p>
                <img src={dropIcon} alt='' />
              </div>
              <div className='h-full w-[1px] bg-gray-200'></div>
              <div className='flex items-center space-x-2 cursor-pointer'>
                <img src={resetIcon} alt='reset filter' />
                <p className='text-[#EA0234]'>Reset Filter</p>
              </div>
            </div>
          </div>
          <div className='flex-1 px-6 py-2'>
            <Table
              data={classesData}
              columns={columns}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              className='mt-4'
              pageSize={7}
              onRowClick={(row: ClassData) =>
                navigateToClassDetails(navigate, row.id.toString())
              }
            />
          </div>
        </div>
      </div>
      <ClassesModal isOpen={isModalOpen} onClose={closeModal} />
      <Modal
        isOpen={isClassTypeModalOpen}
        onClose={() => setIsClassTypeModalOpen(false)}
      >
        <div className='space-y-4'>
          <h3 className='text-lg font-bold text-gray-700'>
            {modalContentType === 'class'
              ? 'Select Class Type'
              : 'Select Category'}
          </h3>

          {modalContentType === 'class' ? (
            <div>
              <div className='flex flex-wrap gap-4 mt-4'>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400 transition-colors'>
                  Trial
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  Makeup
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  Normal
                </button>
              </div>
              <div className='pt-16'>
                <p className='text-gray-400 text-sm'>
                  *You can choose multiple Class types
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className='flex flex-wrap gap-4 mt-4'>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  STARfish
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  STAnley
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  Grade
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  Advanced
                </button>
                <button className='w-[calc(33.33%-12px)] px-2 py-1 border rounded-full border-gray-400  transition-colors'>
                  Platinum
                </button>
              </div>
              <div className='pt-16'>
                <p className='text-gray-400 text-sm'>
                  *You can choose multiple Categories
                </p>
              </div>
            </div>
          )}

          <div className='flex justify-center mt-6'>
            <button
              className='px-6 py-2 bg-black rounded-lg font-semibold text-sm text-white transition-colors'
              onClick={() => setIsClassTypeModalOpen(false)}
            >
              Apply Now
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AllClasses;
