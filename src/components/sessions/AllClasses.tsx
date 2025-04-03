import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';

import MembersHeader from '../headers/MembersHeader';
import Table from '../common/Table';
import ClassesModal from './ClassesModal';
import {
  classesData,
  ClassData,
  categoryOptions,
  classTypesOptions,
} from '../utils/dummyData';
import { navigateToSessionDetails } from '../utils/navigationHelpers';
import { DatePickerInput } from '@mantine/dates';
import DropDownMenu from '../common/DropdownMenu';


import actionOptionIcon from '../../assets/icons/actionOption.svg';
import plusIcon from '../../assets/icons/plusWhite.svg';
import classesFilterIcon from '../../assets/icons/classesFilter.svg';
import resetIcon from '../../assets/icons/resetIcon.svg';
import dropIcon from '../../assets/icons/dropIcon.svg';
import dropdownIcon from '../../assets/icons/dropIcon.svg';
import Button from '../common/Button';

const columnHelper = createColumnHelper<ClassData>();

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
  columnHelper.accessor('class', {
    header: 'Session',
    cell: (info) => (
      <div className='text-start'>
        <p className='font-medium text-gray-900 text-sm'>{info.getValue()}</p>
        <p className='text-xs text-gray-500'>{info.row.original.classLevel}</p>
      </div>
    ),
  }),
  columnHelper.accessor('AssignedTo', {
    header: 'Assigned to',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('classType', {
    header: 'Session Type',
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
    header: () => (
      <img
        src={actionOptionIcon}
        alt='Options'
        className='w-4 h-4 cursor-pointer'
      />
    ),
    cell: () => (
      <div className='flex space-x-2'>
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
  const [classTypeDropdownOpen, setClassTypeDropdownOpen] = useState(false);
  const [categoryTypeDropdownOpen, setCategoryTypeDropdownOpen] =
    useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <MembersHeader
          title='All Sessions'
          buttonText='New Session'
          searchPlaceholder='Search by Session, Staff Name or Session Type'
          leftIcon={plusIcon}
          onButtonClick={openModal}
        />
        <div className='flex h-[70px] w-[80%]  ml-6 text-sm p-2 border rounded-md bg-white'>
          <div className='flex items-center justify-between w-full px-6 font-bold '>
            <div className='flex justify-center items-center'>
              <img
                src={classesFilterIcon}
                alt='filter section'
                className='self-center'
              />
            </div>
            <div className='h-full w-[1px] bg-gray-200'></div>
            <div className=''>
              <p className='text-primary text-sm font-normal'>Filter By</p>
            </div>
            <div className='h-full w-[1px] bg-gray-200'></div>

            <div
              className='flex items-center space-x-2 cursor-pointer'
              onClick={() => {}}
            >
              <DatePickerInput
                type='range'
                clearable
                w={130}
                pointer
                placeholder='Pick a date'
                styles={{
                  input: {
                    border: 'none',
                    padding: '0',
                    color: '#162F3B',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    '&:focus': {
                      border: 'none',
                      outline: 'none',
                    },
                  },
                }}
              />
              <img
                src={dropIcon}
                alt=''
                className='text-primary text-sm font-normal'
              />
            </div>
            <div className='h-full w-[1px] bg-gray-200'></div>

            <DropDownMenu
              show={classTypeDropdownOpen}
              setShow={setClassTypeDropdownOpen}
              dropDownPosition='center'
              actionElement={
                <div
                  id='viewSelect'
                  className='p-2 w-full gap-2 h-10 rounded-md outline-none cursor-pointer flex items-center justify-between'
                >
                  <p className='text-primary text-sm font-normal'>Session Type</p>
                  <img src={dropdownIcon} alt='dropdown icon' />
                </div>
              }
            >
              <div className='space-y-4 p-6'>
                <h3 className='text-lg font-bold text-gray-700'>
                  Select Session Type
                </h3>

                <div>
                  <div className='flex flex-wrap gap-4 mt-4 min-w-[300px]'>
                    {classTypesOptions.map((label, index) => (
                      <button
                        key={index}
                        className='w-[calc(33.33%-12px)] px-2 py-2 border rounded-full border-gray-400 text-primary font-nomal text-xs'
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className='pt-16'>
                    <p className='text-gray-400 text-sm'>
                      *You can choose multiple Class types
                    </p>
                  </div>
                </div>
                <div className='flex justify-center mt-6'>
                  <Button
                    color='#1D9B5E'
                    radius='md'
                    size='sm'
                    onClick={() => setClassTypeDropdownOpen(false)}
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            </DropDownMenu>
            <div className='h-full w-[1px] bg-gray-200'></div>
            <DropDownMenu
              show={categoryTypeDropdownOpen}
              setShow={setCategoryTypeDropdownOpen}
              dropDownPosition='center'
              actionElement={
                <div
                  id='viewSelect'
                  className='p-2 w-full gap-2 h-10 rounded-md outline-none cursor-pointer flex items-center justify-between'
                >
                  <p className='text-primary text-sm font-normal'>Category</p>
                  <img src={dropdownIcon} alt='dropdown icon' />
                </div>
              }
            >
              <div className='space-y-4 p-6'>
                <h3 className='text-lg font-bold text-gray-700'>
                  Select Category
                </h3>

                <div>
                  <div className='flex flex-wrap gap-4 mt-4 min-w-[300px]'>
                    {categoryOptions.map((label, index) => (
                      <button
                        key={index}
                        className='w-[calc(33.33%-12px)] px-2 py-2 border rounded-full border-gray-400 text-primary font-nomal text-xs'
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className='pt-16'>
                    <p className='text-gray-400 text-sm'>
                      *You can choose multiple Categories
                    </p>
                  </div>
                </div>
                <div className='flex justify-center mt-6'>
                  <Button
                    color='#1D9B5E'
                    radius='md'
                    size='sm'
                    onClick={() => setCategoryTypeDropdownOpen(false)}
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            </DropDownMenu>
            <div className='h-full w-[1px] bg-gray-200'></div>
            <div className='flex items-center space-x-2 cursor-pointer'>
              <img
                src={resetIcon}
                alt='reset filter'
                className='text-[#EA0234] text-sm font-normal'
              />
              <p className='text-[#EA0234] text-sm font-normal'>Reset Filter</p>
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
              navigateToSessionDetails(navigate, row.id.toString())
            }
          />
        </div>
      </div>
      <ClassesModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default AllClasses;
