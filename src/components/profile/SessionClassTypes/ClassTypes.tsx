import { useState } from 'react';
import { ActionIcon, Group, Loader, Modal, Text, Drawer } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useUIStore } from '../../../store/ui';
import Button from '../../common/Button';
import successIcon from '../../../assets/icons/success.svg';
import errorIcon from '../../../assets/icons/error.svg';
import {
  useGetClassTypes,
  useDeleteClassType,
} from '../../../hooks/reactQuery';
import { ClassTypeForm } from './ClassTypeForm';

type ClassType = {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
};

const ClassTypes = () => {
  const [classTypeToDelete, setClassTypeToDelete] = useState<ClassType | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingClassTypeId, setEditingClassTypeId] = useState<string | null>(
    null
  );

  const { openDrawer } = useUIStore();

  const { data: classTypes = [], isLoading, refetch } = useGetClassTypes();
  const { mutateAsync: deleteClassType } = useDeleteClassType();

  const handleAddClassType = () => {
    setEditingClassTypeId(null);
    setIsDrawerOpen(true);
  };

  const handleEditClassType = (classType: ClassType) => {
    setEditingClassTypeId(classType.id);
    setIsDrawerOpen(true);
  };

  const handleDeleteClassType = (classType: ClassType) => {
    setClassTypeToDelete(classType);
    setDeleteModalOpen(true);
  };

  const confirmDeleteClassType = async () => {
    if (!classTypeToDelete) return;
    try {
      await deleteClassType(classTypeToDelete.id);
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Class type deleted successfully',
        icon: <img src={successIcon} alt='Success' />,
      });
      setDeleteModalOpen(false);
      setClassTypeToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting class type:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to delete class type. Please try again.',
        icon: <img src={errorIcon} alt='Error' />,
      });
      setDeleteModalOpen(false);
      setClassTypeToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsDrawerOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen p-6 pt-12'>
        <Loader size='md' color='#1D9B5E' />
      </div>
    );
  }

  return (
    <div className='w-full bg-white rounded-lg md:p-6 p-2 shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Session Class Types</h2>
        <Button
          onClick={handleAddClassType}
          variant='filled'
          color='#1D9B5E'
          radius='md'
          size='sm'
          leftSection={<IconPlus size={16} />}
        >
          Add Class Type
        </Button>
      </div>

      <div className='bg-white rounded-lg md:p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {classTypes.map((classType: ClassType) => (
            <div
              key={classType.id}
              className='border border-gray-200 bg-cardsBg rounded-lg p-4 shadow-sm transition-shadow font-sans'
            >
              <div className='flex justify-between items-start gap-2'>
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-sm font-medium text-primary font-sans'>
                      {classType.name}
                    </h3>
                    <div
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        classType.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          classType.is_active ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></div>
                      <span>{classType.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  {classType.description && (
                    <p className='text-gray-600 mt-1 text-sm font-sans'>
                      {classType.description}
                    </p>
                  )}
                </div>
                <Group gap={8} ml='auto'>
                  <ActionIcon
                    color='#1D9B5E'
                    variant='outline'
                    radius='xl'
                    onClick={() => handleEditClassType(classType)}
                    className='hover:bg-blue-50'
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    color='red'
                    variant='outline'
                    radius='xl'
                    onClick={() => handleDeleteClassType(classType)}
                    className='hover:bg-red-50'
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Drawer
        opened={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingClassTypeId ? 'Edit Class Type' : 'Add New Class Type'}
        padding='xl'
        size='md'
        position='right'
      >
        <ClassTypeForm
          classTypeId={editingClassTypeId || undefined}
          onSuccess={handleFormSuccess}
        />
      </Drawer>

      <Modal
        opened={deleteModalOpen}
        className='font-sans'
        onClose={() => setDeleteModalOpen(false)}
        title='Delete Session Type'
        centered
        radius='md'
      >
        <Text size='sm' mb='xl'>
          Are you sure you want to delete the session type{' '}
          <span className='font-semibold text-secondary'>
            {classTypeToDelete?.name}
          </span>
          ? This action cannot be undone.
        </Text>
        <div className='flex justify-end gap-3'>
          <Button variant='filled' color='red' onClick={confirmDeleteClassType}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ClassTypes;
