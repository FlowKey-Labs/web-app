import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';

import MembersHeader from '../headers/MembersHeader';
import Table from '../common/Table';
import { classTypesOptions } from '../../utils/dummyData';
import {
  useGetSessions,
  useGetSessionCategories,
  useActivateSession,
  useDeactivateSession,
} from '../../hooks/reactQuery';
import { Session } from '../../types/sessionTypes';
import { navigateToSessionDetails } from '../../utils/navigationHelpers';
import { DatePickerInput } from '@mantine/dates';
import DropDownMenu from '../common/DropdownMenu';
import { useExportSessions } from '../../hooks/useExport';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import plusIcon from '../../assets/icons/plusWhite.svg';
import classesFilterIcon from '../../assets/icons/classesFilter.svg';
import resetIcon from '../../assets/icons/resetIcon.svg';
import dropdownIcon from '../../assets/icons/dropIcon.svg';
import Button from '../common/Button';

import EmptyDataPage from '../common/EmptyDataPage';
import {
  Group,
  Menu,
  Modal,
  Text,
  Button as MantineButton,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { useAuthStore } from '../../store/auth';
import { useUIStore } from '../../store/ui';

const columnHelper = createColumnHelper<Session>();

const AllSessions = () => {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState({});
  const [classTypeDropdownOpen, setClassTypeDropdownOpen] = useState(false);
  const [categoryTypeDropdownOpen, setCategoryTypeDropdownOpen] =
    useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const [tempSelectedTypes, setTempSelectedTypes] = useState<string[]>([]);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<
    string[]
  >([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const { openDrawer } = useUIStore();

  const activateSessionMutation = useActivateSession();
  const deactivateSessionMutation = useDeactivateSession();

  const permisions = useAuthStore((state) => state.role);

  const {
    data: allSessionsData,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useGetSessions();

  const filteredSessions = useMemo(() => {
    if (!allSessionsData) return [];

    return allSessionsData.filter((session) => {
      if (selectedTypes.length > 0) {
        const classType = session.class_type || '';
        const matchesType = selectedTypes.includes(classType);

        if (!matchesType) {
          return false;
        }
      }

      if (selectedCategories.length > 0) {
        const sessionCategory = session.category?.name || '';

        const matchesCategory = selectedCategories.includes(sessionCategory);

        if (!matchesCategory) {
          return false;
        }
      }

      if (dateRange[0] && dateRange[1]) {
        const sessionDate = new Date(session.date);
        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);

        sessionDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (sessionDate < startDate || sessionDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [allSessionsData, selectedTypes, selectedCategories, dateRange]);

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportSessions(filteredSessions || []);

  const getSelectedSessionIds = useCallback(() => {
    if (!filteredSessions) return [];

    return Object.keys(rowSelection).map((index) => {
      const sessionIndex = parseInt(index);
      return filteredSessions[sessionIndex].id;
    });
  }, [rowSelection, filteredSessions]);
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetSessionCategories();

  const columns = useMemo(
    () => [
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
            onClick={(e) => e.stopPropagation()}
            onChange={row.getToggleSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
      }),
      columnHelper.accessor('title', {
        header: 'Session',
        cell: (info) => (
          <div className='text-start'>
            <p className='font-medium text-gray-900 text-sm'>
              {info.getValue()}
            </p>
            <p className='text-xs text-gray-500'>
              {info.row.original.category?.name || ''}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('assigned_staff', {
        header: 'Assigned to',
        cell: (info) => {
          const assignedStaff = info.getValue();
          return assignedStaff
            ? `${assignedStaff.user.first_name} ${assignedStaff.user.last_name}`
            : 'Unassigned';
        },
      }),
      columnHelper.accessor('class_type', {
        header: 'Session Type',
        cell: (info) => {
          const SessionType = info.getValue();
          return SessionType
            ? SessionType.charAt(0).toUpperCase() + SessionType.slice(1)
            : '';
        },
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

            const formatTo12Hour = (isoDateTimeStr: string) => {
              if (!isoDateTimeStr || typeof isoDateTimeStr !== 'string')
                return isoDateTimeStr;

              try {
                const timePart = isoDateTimeStr.split('T')[1];
                if (!timePart) {
                  return isoDateTimeStr;
                }

                const timeComponents = timePart.split(':');
                let hours = parseInt(timeComponents[0], 10);
                const minutes = timeComponents[1].padStart(2, '0');

                const ampm = hours >= 12 ? 'PM' : 'AM';

                hours = hours % 12;
                hours = hours ? hours : 12;

                return `${hours}:${minutes} ${ampm}`;
              } catch (e) {
                console.error('Error formatting time:', isoDateTimeStr, e);
                return isoDateTimeStr;
              }
            };

            return `${formatTo12Hour(start)} - ${formatTo12Hour(end)}`;
          },
        }
      ),
      columnHelper.accessor(
        (row) => ({
          repeat_on: row.repeat_on,
          repeat_unit: row.repeat_unit,
          repeat_every: row.repeat_every,
        }),
        {
          id: 'repeats',
          header: 'Repeats',
          cell: (info) => {
            const { repeat_on, repeat_unit, repeat_every } = info.getValue();

            const dayMap: Record<number, string> = {
              1: 'Mon',
              2: 'Tue',
              3: 'Wed',
              4: 'Thu',
              5: 'Fri',
              6: 'Sat',
              0: 'Sun',
            };

            if (repeat_unit === 'days' && repeat_every) {
              return `Daily`;
            }

            if (repeat_unit === 'weeks') {
              return `Weekly`;
            }
            if (repeat_unit === 'months' && repeat_every) {
              return `Monthly`;
            }

            if (repeat_on && repeat_on.length > 0) {
              return repeat_on
                .map((day: string) => dayMap[Number(day)] || '')
                .join(', ');
            }

            return 'No Repeats';
          },
        }
      ),
      columnHelper.accessor('is_active', {
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
        id: 'actions',
        header: () => (
          <div className='flex space-x-2' onClick={(e) => e.stopPropagation()}>
            <Group justify='center'>
              <Menu
                width={150}
                shadow='md'
                position='bottom'
                radius='md'
                withArrow
                offset={4}
              >
                <Menu.Target>
                  <img
                    src={actionOptionIcon}
                    alt='Options'
                    className='w-4 h-4 cursor-pointer'
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color='#162F3B'
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                    onClick={openExportModal}
                  >
                    Export Session
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>
        ),
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div
              className='flex space-x-2'
              onClick={(e) => e.stopPropagation()}
            >
              <Group justify='center'>
                <Menu
                  width={150}
                  shadow='md'
                  position='bottom'
                  radius='md'
                  withArrow
                  offset={4}
                >
                  <Menu.Target>
                    <img
                      src={actionOptionIcon}
                      alt='Options'
                      className='w-4 h-4 cursor-pointer'
                    />
                  </Menu.Target>
                  <Menu.Dropdown>
                    {session.is_active ? (
                      <Menu.Item
                        color='red'
                        onClick={() => {
                          setSelectedSession(session);
                          setIsActivating(false);
                          open();
                        }}
                        className='text-sm'
                        style={{ textAlign: 'center' }}
                      >
                        Deactivate
                      </Menu.Item>
                    ) : (
                      <Menu.Item
                        color='green'
                        onClick={() => {
                          setSelectedSession(session);
                          setIsActivating(true);
                          open();
                        }}
                        className='text-sm'
                        style={{ textAlign: 'center' }}
                      >
                        Activate
                      </Menu.Item>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </div>
          );
        },
      }),
    ],
    [openExportModal, open, setSelectedSession, setIsActivating]
  );

  const toggleSessionType = (type: string) => {
    setTempSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleCategory = (category: string) => {
    setTempSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const applySessionTypeFilter = () => {
    setSelectedTypes(tempSelectedTypes);
    setClassTypeDropdownOpen(false);
  };

  const applyCategoryFilter = () => {
    setSelectedCategories(tempSelectedCategories);
    setCategoryTypeDropdownOpen(false);
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setDateRange([null, null]);
    setClassTypeDropdownOpen(false);
    setCategoryTypeDropdownOpen(false);
  };

  const handleActivateSession = () => {
    if (!selectedSession) return;

    activateSessionMutation.mutate(selectedSession.id.toString(), {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Session activated successfully!',
          color: 'green',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
        close();
        refetchSessions();
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to activate session. Please try again.',
          color: 'red',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
        close();
      },
    });
  };

  const handleDeactivateSession = () => {
    if (!selectedSession) return;

    deactivateSessionMutation.mutate(selectedSession.id.toString(), {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Session deactivated successfully!',
          color: 'green',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
        close();
        refetchSessions();
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to deactivate session. Please try again.',
          color: 'red',
          radius: 'md',
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
              <img src={errorIcon} alt='Error' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          autoClose: 3000,
          position: 'top-right',
        });
        close();
      },
    });
  };

  const handleOpenAddSession = () => openDrawer({ type: 'session', isEditing: false });

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <MembersHeader
          title='All Sessions'
          buttonText='New Session'
          searchPlaceholder='Search by Session, Staff Name or Session Type'
          leftIcon={plusIcon}
          onButtonClick={handleOpenAddSession}
          showButton={permisions?.can_create_sessions}
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
                setShow={(show) => {
                  if (show && !classTypeDropdownOpen) {
                    setTempSelectedTypes([...selectedTypes]);
                  }
                  setClassTypeDropdownOpen(show);
                }}
                dropDownPosition='center'
                actionElement={
                  <div
                    id='viewSelect'
                    className='p-2 w-full gap-2 h-10 rounded-md outline-none cursor-pointer flex items-center justify-between'
                  >
                    <p className='text-primary text-sm font-normal'>
                      {selectedTypes.length > 0
                        ? selectedTypes
                            .map(
                              (type) =>
                                type.charAt(0).toUpperCase() + type.slice(1)
                            )
                            .join(', ')
                        : 'Session Type'}
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
                    <div className='flex flex-col gap-2 mt-4 min-w-[160px]'>
                      {classTypesOptions.map((label, index) => (
                        <div key={index} className='flex items-center'>
                          <input
                            type='checkbox'
                            id={`session-type-${index}`}
                            checked={tempSelectedTypes.includes(label)}
                            onChange={() => toggleSessionType(label)}
                            className='mr-2 h-4 w-4 rounded border-gray-300 focus:ring-0 focus:ring-offset-0 accent-[#1D9B5E]'
                          />
                          <label
                            htmlFor={`session-type-${index}`}
                            className={`text-sm cursor-pointer ${
                              tempSelectedTypes.includes(label)
                                ? 'text-secondary font-medium'
                                : 'text-primary'
                            }`}
                          >
                            {label.charAt(0).toUpperCase() + label.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className='pt-4'>
                      <p className='text-gray-400 text-sm'>
                        *You can choose multiple Session types
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
                setShow={(show) => {
                  if (show && !categoryTypeDropdownOpen) {
                    setTempSelectedCategories([...selectedCategories]);
                  }
                  setCategoryTypeDropdownOpen(show);
                }}
                dropDownPosition='center'
                actionElement={
                  <div
                    id='viewSelect'
                    className='p-2 w-full gap-2 h-10 rounded-md outline-none cursor-pointer flex items-center justify-between'
                  >
                    <p className='text-primary text-sm font-normal'>
                      {selectedCategories.length > 0
                        ? selectedCategories.join(', ')
                        : 'Categories'}
                    </p>
                    <img src={dropdownIcon} alt='dropdown icon' />
                  </div>
                }
              >
                <div className='space-y-4 p-6'>
                  <h3 className='text-lg font-bold text-gray-700'>
                    Select Category
                  </h3>

                  <div>
                    <div className='flex flex-col gap-2 mt-4 min-w-[160px]'>
                      {isLoadingCategories ? (
                        <p>Loading categories...</p>
                      ) : categoriesData && categoriesData.length > 0 ? (
                        categoriesData.map(
                          (category: { id: number; name: string }) => (
                            <div
                              key={category.id}
                              className='flex items-center'
                            >
                              <input
                                type='checkbox'
                                id={`category-${category.id}`}
                                checked={tempSelectedCategories.includes(
                                  category.name
                                )}
                                onChange={() => toggleCategory(category.name)}
                                className='mr-2 h-4 w-4 rounded border-gray-300 focus:ring-0 focus:ring-offset-0 accent-[#1D9B5E]'
                              />
                              <label
                                htmlFor={`category-${category.id}`}
                                className={`text-sm cursor-pointer ${
                                  tempSelectedCategories.includes(category.name)
                                    ? 'text-secondary font-medium'
                                    : 'text-primary'
                                }`}
                              >
                                {category.name}
                              </label>
                            </div>
                          )
                        )
                      ) : (
                        <p>No categories available</p>
                      )}
                    </div>
                    <div className='pt-4'>
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
        <EmptyDataPage
          title='No Sessions Found!'
          description="You don't have any sessions yet"
          buttonText='Create New Session'
          onButtonClick={handleOpenAddSession}
          showButton={permisions?.can_create_sessions}
          onClose={() => {
            if (
              selectedTypes.length > 0 ||
              selectedCategories.length > 0 ||
              (dateRange[0] && dateRange[1])
            ) {
              resetFilters();
            }
          }}
          opened={
            (!filteredSessions || filteredSessions.length === 0) && !isLoadingSessions
          }
          filterType={
            selectedTypes.length === 1
              ? 'sessionType'
              : selectedCategories.length === 1
              ? 'category'
              : undefined
          }
          filterValue={
            selectedTypes.length === 1
              ? selectedTypes[0]
              : selectedCategories.length === 1
              ? selectedCategories[0]
              : undefined
          }
        />
        <div className='flex-1 px-6 py-2'>
          {isLoadingSessions || isLoadingCategories ? (
            <div className='flex justify-center items-center py-10'>
              <p>Loading sessions data...</p>
            </div>
          ) : (
            <Table
              data={filteredSessions || []}
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

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={600} size='lg'>
            {isActivating ? 'Activate Session' : 'Deactivate Session'}
          </Text>
        }
        centered
        radius='md'
        size='md'
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        shadow='xl'
      >
        <div className='flex items-start space-x-4 mb-6'>
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${
              isActivating ? 'bg-green-100' : 'bg-red-100'
            } flex items-center justify-center`}
          >
            <img
              src={isActivating ? successIcon : errorIcon}
              alt='Warning'
              className='w-5 h-5'
            />
          </div>
          <div>
            <Text fw={500} size='md' mb={8} c='gray.8'>
              Are you sure you want to{' '}
              {isActivating ? 'activate' : 'deactivate'} this session?
            </Text>
            <Text size='sm' c='gray.6'>
              {isActivating
                ? 'This action will make the session active in the system. It will appear in active session lists.'
                : 'This action will make the session inactive in the system. It will no longer appear in active session lists.'}
            </Text>
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <MantineButton
            variant='subtle'
            onClick={close}
            color='gray'
            radius='md'
          >
            Cancel
          </MantineButton>
          <MantineButton
            color={isActivating ? 'green' : 'red'}
            onClick={
              isActivating ? handleActivateSession : handleDeactivateSession
            }
            loading={
              isActivating
                ? activateSessionMutation.isPending
                : deactivateSessionMutation.isPending
            }
            radius='md'
          >
            {isActivating ? 'Activate' : 'Deactivate'}
          </MantineButton>
        </div>
      </Modal>

      <Modal
        opened={exportModalOpened}
        onClose={closeExportModal}
        title={
          <Text fw={600} size='lg'>
            Export Sessions
          </Text>
        }
        centered
        radius='md'
        size='md'
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        shadow='xl'
      >
        <div className='py-2'>
          <Text size='sm' style={{ marginBottom: '2rem' }}>
            Select a format to export {Object.keys(rowSelection).length}{' '}
            selected sessions
          </Text>

          <Stack gap='md'>
            <MantineButton
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => handleExport('excel', getSelectedSessionIds())}
              className='px-6'
              loading={isExporting}
            >
              Export as Excel
            </MantineButton>

            <MantineButton
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => handleExport('csv', getSelectedSessionIds())}
              className='px-6'
              loading={isExporting}
            >
              Export as CSV
            </MantineButton>
          </Stack>

          <div className='flex justify-end space-x-4 mt-8'>
            <MantineButton
              variant='outline'
              color='red'
              radius='md'
              onClick={closeExportModal}
              className='px-6'
            >
              Cancel
            </MantineButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AllSessions;
