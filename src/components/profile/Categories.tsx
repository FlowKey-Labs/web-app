import { useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { ActionIcon, Drawer, Group, Loader, Modal, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

import Input from '../common/Input';
import {
  useGetSessionCategories,
  useCreateSessionCategory,
  useUpdateSessionCategory,
  useDeleteSessionCategory,
} from '../../hooks/reactQuery';
import { useUIStore } from '../../store/ui';

import Button from '../common/Button';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import CategoryDetails from './CategoryDetails';

type Category = {
  id: number;
  name: string;
  description?: string;
};

type CategoryFormData = {
  name: string;
  description: string;
};

const Categories = () => {
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  // Global UI store for drawer management
  const { openDrawer } = useUIStore();

  const {
    data: categoriesData,
    isLoading,
    refetch,
  } = useGetSessionCategories();
  const { mutateAsync: deleteCategory } = useDeleteSessionCategory();

  const handleAddCategory = () => {
    openDrawer({
      type: 'category',
      isEditing: false
    });
  };

  const handleEditCategory = (category: Category) => {
    openDrawer({
      type: 'category',
      entityId: category.id,
      isEditing: true
    });
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory({ id: categoryToDelete.id });
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Category deleted successfully',
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
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting category:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to delete category. Please try again.',
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
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className='w-full bg-white rounded-lg p-6 shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>
          {selectedCategoryId ? '' : 'Session Categories'}
        </h2>
        {selectedCategoryId ? (
          ''
        ) : (
          <Button
            onClick={handleAddCategory}
            variant='filled'
            color='#1D9B5E'
            radius='md'
            size='sm'
            leftSection={<IconPlus size={16} />}
          >
            Add Category
          </Button>
        )}
      </div>

      {selectedCategoryId ? (
        <CategoryDetails
          categoryId={selectedCategoryId}
          onBack={() => setSelectedCategoryId(null)}
        />
      ) : isLoading ? (
        <div className='flex justify-center items-center h-screen p-6 pt-12'>
          <Loader size='xl' color='#1D9B5E' />
        </div>
      ) : (
        <div className='bg-white rounded-lg p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {categoriesData?.map((category: Category) => (
              <div
                key={category.id}
                className='border border-gray-200 bg-cardsBg rounded-lg p-4 shadow-sm transition-shadow font-sans cursor-pointer'
                onClick={() => setSelectedCategoryId(category.id)}
              >
                <div className='flex justify-between items-start'>
                  <h3 className='text-sm font-medium text-primary font-sans'>
                    {category.name}
                  </h3>
                  <Group gap={8} ml='auto'>
                    <ActionIcon
                      color='#1D9B5E'
                      variant='outline'
                      radius='xl'
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleEditCategory(category)
                      }}
                      className='hover:bg-blue-50'
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color='red'
                      variant='outline'
                      radius='xl'
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteCategory(category)
                      }}
                      className='hover:bg-red-50'
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </div>
                {category.description && (
                  <p className='text-gray-600 mt-2 text-sm font-sans'>
                    {category.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Modal
        opened={deleteModalOpen}
        className='font-sans'
        onClose={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        title={
          <Text fw={600} size='lg'>
            Delete Category
          </Text>
        }
        centered
        radius='md'
        size='md'
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        shadow='xl'
      >
        <div className='flex items-start space-x-4 mb-6'>
          <div className='flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center'>
            <img src={errorIcon} alt='Warning' className='w-5 h-5' />
          </div>
          <div>
            <Text fw={500} size='md' mb={8} c='gray.8' className='font-sans'>
              Are you sure you want to delete this category?
            </Text>
            <Text size='sm' c='gray.6' className='font-sans'>
              This action cannot be undone. The category will be permanently
              removed.
            </Text>
          </div>
        </div>
        <div className='flex justify-end gap-2 mt-4'>
          <Button
            variant="default"
            onClick={() => {
              setDeleteModalOpen(false);
              setCategoryToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button color='red' onClick={confirmDeleteCategory} radius='md'>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
