import Table from '../common/Table';
import {
  useGetAttendedSessions,
  useDeleteAttendedSession,
} from '../../hooks/reactQuery';
import { createColumnHelper } from '@tanstack/react-table';
import { AttendedSession } from '../../types/sessionTypes';
import { Loader, Menu, Text, Group, Modal, Button, Stack } from '@mantine/core';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';

import actionOptionIcon from '../../assets/icons/actionOption.svg';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

const columnHelper = createColumnHelper<AttendedSession>();

const AttendSession = ({ clientId }: { clientId: string | number }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [selectedAttendedSession, setSelectedAttendedSession] =
    useState<AttendedSession | null>(null);
  const [isRemovingAttendedSession, setIsRemovingAttendedSession] =
    useState(false);

  const [opened, { open, close }] = useDisclosure(false);

  const removeAttendedSessionMutation = useDeleteAttendedSession();

  const {
    data: attendedSessions,
    isLoading: attendedSessionsLoading,
    isError: attendedSessionsError,
    error: attendedSessionsErrorDetails,
    refetch: refetchAttendedSessions,
  } = useGetAttendedSessions();

  const filteredAttendedSessions = attendedSessions?.filter(
    (s: AttendedSession) => {
      return s.client?.toString() === clientId.toString();
    }
  );

  const getSelectedAttendedSessionIds = useCallback(() => {
    if (!attendedSessions) return [];

    const selectedIds = Object.keys(rowSelection)
      .map((index) => {
        const attendedSessionIndex = parseInt(index);
        const selectedSession = attendedSessions[attendedSessionIndex];
        return selectedSession?.id.toString();
      })
      .filter(Boolean);

    return selectedIds;
  }, [rowSelection, attendedSessions]);

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
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => moment(info.getValue()).format('YYYY-MM-DD'),
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
                  //   onClick={openExportModal}
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
                    setSelectedAttendedSession(client);
                    // setIsRemovingAttendedSession(true);
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

  if (attendedSessionsLoading) {
      return (
        <div className='flex items-center justify-center h-full'>
          <Loader color='#1D9B5E' size='xl' />
        </div>
      );
    }
  
    if (attendedSessionsError) {
      return (
        <div className='flex items-center justify-center h-full flex-col'>
          <Text>
            Error fetching attended sessions {attendedSessionsErrorDetails?.message}
          </Text>
          <div className='mt-4'>
            <button
              onClick={() => refetchAttendedSessions()}
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
        data={filteredAttendedSessions || []}
        pageSize={5}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={600} size='lg'>
            Remove Attended Session
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
              Are you sure you want to remove this attended session?
            </Text>
            <Text size='sm' c='gray.6'>
              This action will remove the attended session from the system. They
              will no longer appear in attended session lists.
            </Text>
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <Button
            color='red'
            onClick={() => {
              removeAttendedSessionMutation.mutateAsync(
                {
                  id: selectedAttendedSession?.id?.toString() || '',
                },
                {
                  onSuccess: () => {
                    setIsRemovingAttendedSession(false);
                    notifications.show({
                      title: 'Success',
                      message: 'Attended session removed successfully',
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
                    console.error('Failed to remove attended session:', error);
                    notifications.show({
                      title: 'Error',
                      message:
                        'Failed to remove attended session. Please try again.',
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
              isRemovingAttendedSession
                ? removeAttendedSessionMutation.isPending
                : false
            }
            radius='md'
          >
            Remove
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default AttendSession;
