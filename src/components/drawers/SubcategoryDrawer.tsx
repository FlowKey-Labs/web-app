import { useEffect } from 'react';
import { Drawer, Button, Group } from '@mantine/core';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';

import Input from '../common/Input';
import { useUIStore } from '../../store/ui';
import {
  useGetSessionSubCategories,
  useCreateSessionSubCategory,
  useUpdateSessionSubCategory,
} from '../../hooks/reactQuery';

import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

interface Subcategory {
  id: number;
  name: string;
  description?: string;
  category: number;
}

interface SubcategoryFormData {
  name: string;
  description?: string;
  category: number;
}

interface SubcategoryDrawerProps {
  entityId?: number | string | null;
  isEditing?: boolean;
  extraData?: Record<string, any>;
  zIndex?: number;
}

export default function SubcategoryDrawer({ 
  entityId, 
  isEditing,
  extraData,
  zIndex
}: SubcategoryDrawerProps) {
  const { closeDrawer } = useUIStore();
  
  const methods = useForm<SubcategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      category: extraData?.categoryId || 0,
    },
  });
  
  const { reset, handleSubmit } = methods;
  
  const { data: subcategories, refetch } = useGetSessionSubCategories();
  const { mutateAsync: createSubcategory } = useCreateSessionSubCategory();
  const { mutateAsync: updateSubcategory } = useUpdateSessionSubCategory();

  useEffect(() => {
    if (isEditing && entityId && subcategories) {
      const subcategoryToEdit = subcategories.find(
        (sub: Subcategory) => sub.id.toString() === entityId.toString()
      );
      
      if (subcategoryToEdit) {
        reset({
          name: subcategoryToEdit.name,
          description: subcategoryToEdit.description || '',
          category: subcategoryToEdit.category,
        });
      }
    } else if (extraData?.categoryId) {
      reset({
        name: '',
        description: '',
        category: extraData.categoryId,
      });
    }
  }, [entityId, isEditing, subcategories, reset, extraData]);

  const onSubmit = async (formData: SubcategoryFormData) => {
    try {
      if (isEditing && entityId) {
        await updateSubcategory({ 
          id: Number(entityId),
          ...formData 
        });
        
        notifications.show({
          title: 'Success',
          message: 'Subcategory updated successfully!',
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
        await createSubcategory({
          ...formData,
          category: formData.category || extraData?.categoryId || 0,
        });
        
        notifications.show({
          title: 'Success',
          message: 'Subcategory created successfully!',
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
      
      await refetch();
      closeDrawer();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save subcategory. Please try again.',
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

  useEffect(() => {
    return () => {
      refetch();
    };
  }, [refetch]);

  return (
    <Drawer
      opened={true}
      onClose={closeDrawer}
      title={isEditing ? 'Edit Subcategory' : 'Add New Subcategory'}
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
            rules={{ required: 'Subcategory name is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label='Subcategory Name'
                placeholder='Enter subcategory name'
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
                placeholder='Enter subcategory description'
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
              {isEditing ? 'Update' : 'Add'} Subcategory
            </Button>
          </Group>
        </form>
      </FormProvider>
    </Drawer>
  );
} 