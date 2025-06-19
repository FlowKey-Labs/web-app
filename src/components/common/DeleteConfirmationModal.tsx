import { Text, Button as MantineButton, Modal, Button } from '@mantine/core';
import errorIcon from '../../assets/icons/error.svg';
import { useDeleteSession } from '../../hooks/reactQuery';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  sessionId,
  onSuccess,
  onError,
}: DeleteConfirmationModalProps) => {
  const deleteSession = useDeleteSession();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    if (!sessionId) {
      notifications.show({
        title: 'Error',
        message: 'No session ID provided for deletion',
        color: 'red',
      });
      return;
    }

    deleteSession.mutate(sessionId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
        onClose();
        onSuccess?.();
        notifications.show({
          title: 'Success',
          message: 'Session deleted successfully',
          color: 'green',
        });
      },
      onError: (error) => {
        console.error('Error deleting session:', error);
        onError?.(error);
        notifications.show({
          title: 'Error',
          message: error?.message || 'Failed to delete session',
          color: 'red',
        });
      },
    });
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Text fw={600} size='lg'>
          Delete Session
        </Text>
      }
      centered
      radius='md'
      size='md'
      zIndex={1000}
      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      shadow='xl'
    >
      <div className='flex items-start space-x-4 mb-6'>
        <div className='flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center'>
          <img src={errorIcon} alt='Warning' className='w-5 h-5' />
        </div>
        <div>
          <Text fw={500} size='md' mb={8} c='gray.8'>
            Are you sure you want to delete this session?
          </Text>
          <Text size='sm' c='gray.6'>
            This action cannot be undone. All session data including attendance
            records will be permanently removed from the system.
          </Text>
        </div>
      </div>

      <div className='flex justify-end gap-2 mt-4'>
        <Button variant='outline' onClick={onClose} radius='md'>
          Cancel
        </Button>
        <Button
          color='red'
          onClick={handleDelete}
          loading={deleteSession.isPending}
          disabled={deleteSession.isPending}
          radius='md'
        >
          {deleteSession.isPending ? 'Deleting...' : 'Delete Session'}
        </Button>
      </div>
    </Modal>
  );
};
