import Table from '../common/Table';
import {
  useGetMakeupSessions,
  useDeleteMakeupSession,
} from '../../hooks/reactQuery';
import { createColumnHelper } from '@tanstack/react-table';
import { MakeUpSession } from '../../types/sessionTypes';
import { Loader, Menu, Text, Group, Modal, Button, Stack } from '@mantine/core';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { useExportMakeupSessions } from '../../hooks/useExport';

import actionOptionIcon from '../../assets/icons/actionOption.svg';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

const columnHelper = createColumnHelper<MakeUpSession>();

const MakeUp = ({ clientId }: { clientId: string | number }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [selectedMakeupSession, setSelectedMakeupSession] =
    useState<MakeUpSession | null>(null);
  const [isRemovingMakeupSession, setIsRemovingMakeupSession] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);

  const {
    data: makeupSessions,
    isLoading: makeupSessionsLoading,
    isError: makeupSessionsError,
    error: makeupSessionsErrorDetails,
    refetch: refetchMakeupSessions,
  } = useGetMakeupSessions();

  const removeMakeupSessionMutation = useDeleteMakeupSession();

  const filteredMakeupSessions = makeupSessions?.filter((s: MakeUpSession) => {
    return s.client?.toString() === clientId.toString();
  });

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportMakeupSessions(makeupSessions || []);

  const getSelectedMakeupSessionIds = useCallback(() => {
    if (!makeupSessions) return [];

    const selectedIds = Object.keys(rowSelection)
      .map((index) => {
        const makeupSessionIndex = parseInt(index);
        const selectedSession = makeupSessions[makeupSessionIndex];
        return selectedSession?.id.toString();
      })
      .filter(Boolean);

    return selectedIds;
  }, [rowSelection, makeupSessions]);

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
    columnHelper.accessor('session_title', {
      header: 'Sessions',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('original_date', {
      header: 'Original Date',
      cell: (info) => moment(info.getValue()).format('YYYY-MM-DD'),
    }),
    columnHelper.accessor('new_date', {
      header: 'New Date',
      cell: (info) => moment(info.getValue()).format('YYYY-MM-DD'),
    }),
    columnHelper.accessor('new_start_time', {
      header: 'New Start Time',
      cell: (info) => moment(info.getValue()).format('HH:mm'),
    }),
    columnHelper.accessor('new_end_time', {
      header: 'New End Time',
      cell: (info) => moment(info.getValue()).format('HH:mm'),
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
                  Export Makeup Session
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </div>
      ),
      cell: ({ row }) => {
        const client = row.original;

        return (
          <div className='flex space-x-2' onClick={(e) => e.stopPropagation()}>
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
                  color='red'
                  onClick={() => {
                    setSelectedMakeupSession(client);
                    setIsRemovingMakeupSession(true);
                    open();
                  }}
                  className='text-sm'
                  style={{ textAlign: 'center' }}
                >
                  Remove
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        );
      },
    }),
  ];

  if (makeupSessionsLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader color='#1D9B5E' size='xl' />
      </div>
    );
  }

  if (makeupSessionsError) {
    return (
      <div className='flex items-center justify-center h-full flex-col'>
        <Text>
          Error fetching makeup sessions {makeupSessionsErrorDetails?.message}
        </Text>
        <div className='mt-4'>
          <button
            onClick={() => refetchMakeupSessions()}
            className='bg-secondary text-white px-4 py-2 rounded'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Table
        columns={columns}
        data={filteredMakeupSessions || []}
        pageSize={5}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={600} size='lg'>
            Remove Makeup Session
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
            className={`flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center`}
          >
            <img src={errorIcon} alt='Warning' className='w-5 h-5' />
          </div>
          <div>
            <Text fw={500} size='md' mb={8} c='gray.8'>
              Are you sure you want to remove this makeup session?
            </Text>
            <Text size='sm' c='gray.6'>
              This action will remove the makeup session from the system. They
              will no longer appear in makeup session lists.
            </Text>
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <Button
            color='red'
            onClick={() => {
              removeMakeupSessionMutation.mutateAsync(
                {
                  id: selectedMakeupSession?.id?.toString() || '',
                },
                {
                  onSuccess: () => {
                    setIsRemovingMakeupSession(false);
                    notifications.show({
                      title: 'Success',
                      message: 'Makeup session removed successfully',
                      color: 'green',
                      icon: (
                        <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                          <img
                            src={successIcon}
                            alt='Success'
                            className='w-4 h-4'
                          />
                        </span>
                      ),
                      withBorder: true,
                      autoClose: 3000,
                    });
                    close();
                  },
                  onError: (error) => {
                    console.error('Failed to remove makeup session:', error);
                    notifications.show({
                      title: 'Error',
                      message:
                        'Failed to remove makeup session. Please try again.',
                      color: 'red',
                      icon: (
                        <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                          <img
                            src={errorIcon}
                            alt='Error'
                            className='w-4 h-4'
                          />
                        </span>
                      ),
                      withBorder: true,
                      autoClose: 3000,
                    });
                  },
                }
              );
            }}
            loading={
              isRemovingMakeupSession
                ? removeMakeupSessionMutation.isPending
                : false
            }
            radius='md'
          >
            Remove
          </Button>
        </div>
      </Modal>
      <Modal
        opened={exportModalOpened}
        onClose={closeExportModal}
        title={
          <Text fw={600} size='lg'>
            Export Makeup Sessions
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
            selected makeup sessions
          </Text>

          <Stack gap='md'>
            <Button
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => {
                const selectedIds = getSelectedMakeupSessionIds();
                handleExport('excel', selectedIds);
              }}
              className='px-6'
              loading={isExporting}
            >
              Export as Excel
            </Button>

            <Button
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => handleExport('csv', getSelectedMakeupSessionIds())}
              className='px-6'
              loading={isExporting}
            >
              Export as CSV
            </Button>
          </Stack>

          <div className='flex justify-end space-x-4 mt-8'>
            <Button
              variant='outline'
              color='red'
              radius='md'
              onClick={closeExportModal}
              className='px-6'
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MakeUp;
