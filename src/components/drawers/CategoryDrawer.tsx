import { useEffect } from 'react';
import { Drawer, Button, Group } from '@mantine/core';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';

import Input from '../common/Input';
import { useUIStore } from '../../store/ui';
import {
  useGetSessionCategories,
  useCreateSessionCategory,
  useUpdateSessionCategory,
} from '../../hooks/reactQuery';

import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

// Reuse the same type definitions from the Categories component
interface CategoryData {
  name: string;
  description?: string;
}

// Type definition for category with ID
interface Category extends CategoryData {
  id: number;
}

interface CategoryDrawerProps {
  entityId?: number | string | null;
  isEditing?: boolean;
  zIndex?: number;
}

/**
 * CategoryDrawer component for adding or editing categories
 * This implementation reuses the same functionality from the Categories component
 * but uses the global UI store for managing drawer state
 */
export default function CategoryDrawer({ entityId, isEditing, zIndex }: CategoryDrawerProps) {
  const { closeDrawer } = useUIStore();
  
  const methods = useForm<CategoryData>({
    defaultValues: {
      name: '',
      description: '',
    },
  });
  
  const { reset, handleSubmit } = methods;
  
  // Get category data for editing
  const { data: categoriesData, refetch } = useGetSessionCategories();
  const { mutateAsync: createCategory } = useCreateSessionCategory();
  const { mutateAsync: updateCategory } = useUpdateSessionCategory();

  // Initialize form when editing an existing category
  useEffect(() => {
    if (isEditing && entityId && categoriesData) {
      const categoryToEdit = categoriesData.find(
        (cat: Category) => cat.id.toString() === entityId.toString()
      );
      
      if (categoryToEdit) {
        reset({
          name: categoryToEdit.name,
          description: categoryToEdit.description || '',
        });
      }
    }
  }, [entityId, isEditing, categoriesData, reset]);

  const onSubmit = async (formData: CategoryData) => {
    try {
      if (isEditing && entityId) {
        await updateCategory({ 
          id: Number(entityId),
          ...formData 
        });
        
        notifications.show({
          title: 'Success',
          message: 'Category updated successfully!',
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
      } else {
        await createCategory(formData);
        
        notifications.show({
          title: 'Success',
          message: 'Category created successfully!',
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
      }
      
      // Refresh category data before closing drawer
      await refetch();
      closeDrawer();
    } catch (error) {
      console.error('Error saving category:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save category. Please try again.',
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
    }
  };

  // Add an effect to reload categories when the drawer closes
  useEffect(() => {
    return () => {
      // Run refetch when the component unmounts (drawer closes)
      refetch();
    };
  }, [refetch]);

  return (
    <Drawer
      opened={true}
      onClose={closeDrawer}
      title={isEditing ? 'Edit Category' : 'Add New Category'}
      position='right'
      size='md'
      padding='xl'
      zIndex={zIndex}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <Controller
            name='name'
            control={methods.control}
            rules={{ required: 'Category name is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label='Category Name'
                placeholder='Enter category name'
                containerClassName='mb-4'
              />
            )}
          />
          
          <Controller
            name='description'
            control={methods.control}
            render={({ field }) => (
              <Input
                {...field}
                type='textarea'
                rows={3}
                label='Description'
                placeholder='Enter category description'
                containerClassName='mb-4'
              />
            )}
          />

          <Group justify='flex-end' mt='xl'>
            <Button 
              color='#1D9B5E' 
              type='submit' 
              radius='md' 
              size='sm'
            >
              {isEditing ? 'Update' : 'Add'} Category
            </Button>
          </Group>
        </form>
      </FormProvider>
    </Drawer>
  );
} 