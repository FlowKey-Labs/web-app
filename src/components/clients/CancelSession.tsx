import Table from '../common/Table';
import {
  useGetCancelledSessions,
  useDeleteCancelledSession,
} from '../../hooks/reactQuery';
import { createColumnHelper } from '@tanstack/react-table';
import { CancelledSession } from '../../types/sessionTypes';
import { Loader, Menu, Text, Group, Modal, Button, Stack } from '@mantine/core';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';
import { useExportCancelledSessions } from '../../hooks/useExport';

import actionOptionIcon from '../../assets/icons/actionOption.svg';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

const columnHelper = createColumnHelper<CancelledSession>();

const CancelSession = ({ clientId }: { clientId: string | number }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [selectedCancelledSession, setSelectedCancelledSession] =
    useState<CancelledSession | null>(null);
  const [isRemovingCancelledSession, setIsRemovingCancelledSession] =
    useState(false);

  const [opened, { open, close }] = useDisclosure(false);

  const removeCancelledSessionMutation = useDeleteCancelledSession();

  const {
    data: cancelledSessions,
    isLoading: cancelledSessionsLoading,
    isError: cancelledSessionsError,
    error: cancelledSessionsErrorDetails,
    refetch: refetchCancelledSessions,
  } = useGetCancelledSessions();

  const filteredCancelledSessions = cancelledSessions?.filter(
    (s: CancelledSession) => {
      return s.client?.toString() === clientId.toString();
    }
  );

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportCancelledSessions(cancelledSessions || []);

  const getSelectedCancelledSessionIds = useCallback(() => {
    if (!cancelledSessions) return [];

    const selectedIds = Object.keys(rowSelection)
      .map((index) => {
        const cancelledSessionIndex = parseInt(index);
        const selectedSession = cancelledSessions[cancelledSessionIndex];
        return selectedSession?.id.toString();
      })
      .filter(Boolean);

    return selectedIds;
  }, [rowSelection, cancelledSessions]);

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
            onChange={row.getToggleSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
      }),
      columnHelper.accessor('session_title', {
        header: 'Session',
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
            <div
              className='flex space-x-2'
              onClick={(e) => e.stopPropagation()}
            >
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
                      setSelectedCancelledSession(client);
                      setIsRemovingCancelledSession(true);
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
    ],
    [open]
  );

  if (cancelledSessionsLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader color='#1D9B5E' size='xl' />
      </div>
    );
  }

  if (cancelledSessionsError) {
    return (
      <div className='flex items-center justify-center h-full flex-col'>
        <Text>
          Error fetching cancelled sessions{' '}
          {cancelledSessionsErrorDetails?.message}
        </Text>
        <div className='mt-4'>
          <button
            onClick={() => refetchCancelledSessions()}
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
        data={filteredCancelledSessions || []}
        pageSize={5}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={600} size='lg'>
            Remove Cancelled Session
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
              Are you sure you want to remove this cancelled session?
            </Text>
            <Text size='sm' c='gray.6'>
              This action will remove the cancelled session from the system.
              They will no longer appear in cancelled session lists.
            </Text>
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <Button
            color='red'
            onClick={() => {
              removeCancelledSessionMutation.mutateAsync(
                {
                  id: selectedCancelledSession?.id?.toString() || '',
                },
                {
                  onSuccess: () => {
                    notifications.show({
                      title: 'Cancelled Session Removed',
                      color: 'green',
                      message:
                        'The cancelled session has been successfully removed.',
                    });
                    close();
                    refetchCancelledSessions();
                  },
                  onError: (error) => {
                    notifications.show({
                      title: 'Error Removing Cancelled Session',
                      color: 'red',
                      message:
                        error?.message || 'Failed to remove cancelled session.',
                    });
                  },
                }
              );
            }}
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
            Export Cancelled Sessions
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
            selected cancelled sessions
          </Text>

          <Stack gap='md'>
            <Button
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => {
                const selectedIds = getSelectedCancelledSessionIds();
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
              onClick={() =>
                handleExport('csv', getSelectedCancelledSessionIds())
              }
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

export default CancelSession;
