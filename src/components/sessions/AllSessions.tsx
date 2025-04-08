import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';

import MembersHeader from '../headers/MembersHeader';
import Table from '../common/Table';
import ClassesModal from './SessionModal';
import { categoryOptions, classTypesOptions } from '../../utils/dummyData';
import { useGetSessions, useGetStaff } from '../../hooks/reactQuery';
import { Session, Staff } from '../../types/sessionTypes';
import { navigateToSessionDetails } from '../../utils/navigationHelpers';
import { DatePickerInput } from '@mantine/dates';
import DropDownMenu from '../common/DropdownMenu';

import actionOptionIcon from '../../assets/icons/actionOption.svg';
import plusIcon from '../../assets/icons/plusWhite.svg';
import classesFilterIcon from '../../assets/icons/classesFilter.svg';
import resetIcon from '../../assets/icons/resetIcon.svg';
import dropdownIcon from '../../assets/icons/dropIcon.svg';
import Button from '../common/Button';

const columnHelper = createColumnHelper<Session>();

const AllClasses = () => {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classTypeDropdownOpen, setClassTypeDropdownOpen] = useState(false);
  const [categoryTypeDropdownOpen, setCategoryTypeDropdownOpen] =
    useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const { data: sessionsData, isLoading: isLoadingSessions } = useGetSessions();
  const { data: staffData, isLoading: isLoadingStaff } = useGetStaff();

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
    columnHelper.accessor('title', {
      header: 'Session',
      cell: (info) => (
        <div className='text-start'>
          <p className='font-medium text-gray-900 text-sm'>{info.getValue()}</p>
          <p className='text-xs text-gray-500'>
            {info.row.original.category?.name || ''}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor('staff', {
      header: 'Assigned to',
      cell: (info) => {
        const staffId = info.getValue();
        const staff = staffData?.find((s: Staff) => s.id === staffId);
        return staff ? `${staff.first_name} ${staff.last_name}` : 'Unassigned';
      },
    }),
    columnHelper.accessor('class_type', {
      header: 'Session Type',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('spots', {
      header: 'Slots',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => {
        const dateValue = info.getValue();
        const date = new Date(dateValue);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    }),
    columnHelper.accessor(
      (row) => ({ start: row.start_time, end: row.end_time }),
      {
        id: 'duration',
        header: 'Duration',
        cell: (info) => {
          const { start, end } = info.getValue();

          // Simplest approach - just display the raw values with a separator
          // If start/end are already in the format we want, we can just display them
          console.log('Time values:', { start, end });

          // Simple function to convert 24h time to 12h time with AM/PM
          const formatTo12Hour = (timeStr: string) => {
            if (!timeStr || typeof timeStr !== 'string') return timeStr;

            try {
              // Assuming format is HH:MM:SS or HH:MM
              const parts = timeStr.split(':');
              if (parts.length < 2) return timeStr;

              let hours = parseInt(parts[0], 10);
              const minutes = parts[1].padStart(2, '0');
              const ampm = hours >= 12 ? 'PM' : 'AM';

              // Convert hours from 24-hour to 12-hour format
              hours = hours % 12;
              hours = hours ? hours : 12; // the hour '0' should be '12'

              return `${hours}:${minutes} ${ampm}`;
            } catch (e) {
              console.error('Error formatting time:', timeStr, e);
              return timeStr;
            }
          };

          return `${formatTo12Hour(start)} - ${formatTo12Hour(end)}`;
        },
      }
    ),
    columnHelper.accessor('repeat_on', {
      header: 'Repeats',
      cell: (info) => {
        const repeatDays = info.getValue();

        // Convert day names to short form
        const dayMap: Record<string, string> = {
          Monday: 'Mon',
          Tuesday: 'Tue',
          Wednesday: 'Wed',
          Thursday: 'Thu',
          Friday: 'Fri',
          Saturday: 'Sat',
          Sunday: 'Sun',
        };

        if (!repeatDays || repeatDays.length === 0) return '';

        // Map each day to its short form and join with commas
        return repeatDays.map((day: string) => dayMap[day] || day).join(', ');
      },
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

  const toggleSessionType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const applySessionTypeFilter = () => {
    setClassTypeDropdownOpen(false);
  };

  const applyCategoryFilter = () => {
    // Apply filter logic here using selectedCategories
    setCategoryTypeDropdownOpen(false);
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setDateRange([null, null]);
  };

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
        <div className='flex h-[70px] w-[80%] ml-6 text-sm p-2 border rounded-md bg-white'>
          <div className='flex items-center justify-between w-full px-6 font-bold '>
            <div className='flex justify-center items-center'>
              <img
                src={classesFilterIcon}
                alt='filter section'
                className='self-center'
              />
            </div>
            <div className='h-full w-[1px] bg-gray-200'></div>
            <div className='flex items-center'>
              <p className='text-primary text-sm font-normal'>Filter By</p>
            </div>
            <div className='h-full w-[1px] bg-gray-200'></div>

            <div
              className='flex items-center space-x-2 cursor-pointer'
              onClick={() => {}}
            >
              <DatePickerInput
                type='range'
                pointer
                value={dateRange}
                onChange={setDateRange}
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
                  placeholder: {
                    color: '#162F3B',
                    fontSize: '14px',
                    fontWeight: 'normal',
                  },
                }}
              />
            </div>
            <div className='h-full w-[1px] bg-gray-200'></div>

            <div>
              <DropDownMenu
                show={classTypeDropdownOpen}
                setShow={setClassTypeDropdownOpen}
                dropDownPosition='center'
                actionElement={
                  <div
                    id='viewSelect'
                    className='p-2 w-full gap-2 h-10 rounded-md outline-none cursor-pointer flex items-center justify-between'
                  >
                    <p className='text-primary text-sm font-normal'>
                      Session Type
                    </p>
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
                          onClick={() => toggleSessionType(label)}
                          className={`w-[calc(33.33%-12px)] px-2 py-2 border rounded-full
                            ${
                              selectedTypes.includes(label)
                                ? 'border-secondary bg-secondary text-white'
                                : 'border-gray-400 text-primary'
                            }
                            font-normal text-xs transition-colors duration-200`}
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
                      onClick={applySessionTypeFilter}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </DropDownMenu>
            </div>
            <div className='h-full w-[1px] bg-gray-200'></div>
            <div>
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
                          onClick={() => toggleCategory(label)}
                          className={`w-[calc(33.33%-12px)] px-2 py-2 border rounded-full
                            ${
                              selectedCategories.includes(label)
                                ? 'border-secondary bg-secondary text-white'
                                : 'border-gray-400 text-primary'
                            }
                            font-normal text-xs transition-colors duration-200`}
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
                      onClick={applyCategoryFilter}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </DropDownMenu>
            </div>
            <div className='h-full w-[1px] bg-gray-200'></div>
            <div
              className='flex items-center space-x-2 cursor-pointer'
              onClick={resetFilters}
            >
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
          {isLoadingSessions || isLoadingStaff ? (
            <div className='flex justify-center items-center py-10'>
              <p>Loading sessions data...</p>
            </div>
          ) : !sessionsData || sessionsData.length === 0 ? (
            <div className='flex justify-center items-center py-10'>
              <p>No sessions found. Create a new session to get started.</p>
            </div>
          ) : (
            <Table
              data={sessionsData}
              columns={columns}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              className='mt-4'
              pageSize={7}
              onRowClick={(row: Session) =>
                navigateToSessionDetails(navigate, row.id.toString())
              }
            />
          )}
        </div>
      </div>
      <ClassesModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default AllClasses;
