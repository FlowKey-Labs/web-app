import { useState, useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { ActionIcon, Drawer, Group, Modal, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

import Input from '../common/Input';
import {
  get_session_categories,
  create_session_category,
  update_session_category,
  delete_session_category,
} from '../../api/api';

import EmptyDataPage from '../common/EmptyDataPage';
import Button from '../common/Button';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';

type Category = {
  id: number;
  name: string;
  description?: string;
  subcategories?: string[] | string; // Allow string or string array
};

type CategoryFormData = {
  name: string;
  description: string;
  subcategories: string; // Use string for comma-separated input initially
};

const Categories = () => {
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const methods = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      subcategories: '', // Add default value for subcategories
    },
  });

  const { reset } = methods;

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await get_session_categories();
      // Removed console.log from here
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to load categories. Please try again.',
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    reset({
      name: '',
      description: '',
      subcategories: '', // Reset subcategories
    });
    setIsEditing(false);
    setCurrentCategory(null);
    setIsDrawerOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    reset({
      name: category.name,
      description: category.description || '',
      // Handle string or array for form population
      subcategories: Array.isArray(category.subcategories)
        ? category.subcategories.join(', ')
        : typeof category.subcategories === 'string'
        ? category.subcategories
        : '',
    });
    setIsEditing(true);
    setCurrentCategory(category);
    setIsDrawerOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await delete_session_category(categoryToDelete.id);
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
      fetchCategories();
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

  const onSubmit = async (formData: CategoryFormData) => {
    // Prepare data for API, splitting comma-separated string into an array
    const apiData = {
      ...formData,
      subcategories: formData.subcategories.split(',').map(s => s.trim()).filter(s => s), // Split and clean
    };

    try {
      if (isEditing && currentCategory) {
        await update_session_category(currentCategory.id, apiData);
        notifications.show({
          color: 'green',
          title: 'Success',
          message: 'Category updated successfully',
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
        await create_session_category(apiData);
        notifications.show({
          color: 'green',
          title: 'Success',
          message: 'Category created successfully',
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

      setIsDrawerOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to save category. Please try again.',
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

  return (
    <div className='w-full bg-white rounded-lg p-6 shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Session Categories</h2>
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
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <p>Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <EmptyDataPage
          title='No Categories Found'
          description="You haven't created any categories yet. Categories help you organize your sessions."
          buttonText='Add Category'
          onButtonClick={handleAddCategory}
        />
      ) : (
        <div className='bg-white rounded-lg p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Removed console.log from here */}
            {categories.map((category) => (
              <div
                key={category.id}
                className='border border-gray-200 bg-cardsBg rounded-lg p-4 shadow-sm transition-shadow font-sans'
              >
                <div className='flex justify-between items-start'>
                  <h3 className='text-sm font-medium text-primary font-sans'>
                    {category.name}
                  </h3>
                  <Group gap={8} ml='auto'>
                    <ActionIcon
                      color='blue'
                      variant='light'
                      radius='xl'
                      onClick={() => handleEditCategory(category)}
                      className='hover:bg-blue-50'
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color='red'
                      variant='light'
                      radius='xl'
                      onClick={() => handleDeleteCategory(category)}
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
                {/* Display Subcategories */}
                {(() => {
                  let subcategoriesToDisplay: string[] = [];
                  if (typeof category.subcategories === 'string' && category.subcategories.length > 0) {
                    // Split the string into an array
                    subcategoriesToDisplay = category.subcategories.split(',').map(s => s.trim()).filter(s => s);
                  } else if (Array.isArray(category.subcategories) && category.subcategories.length > 0) {
                    // Use the array directly (assuming it contains strings based on API data)
                    subcategoriesToDisplay = category.subcategories.filter(s => typeof s === 'string' && s.trim().length > 0);
                  }
                  // If it's an empty array or undefined/null, subcategoriesToDisplay remains []

                  if (subcategoriesToDisplay.length > 0) {
                    return (
                      <div className='mt-3'>
                        <p className='text-xs font-medium text-gray-500 mb-1'>Subcategories:</p>
                        <ul className='list-disc list-inside pl-1 space-y-1'>
                          {subcategoriesToDisplay.map((sub, index) => (
                            <li key={index} className='text-gray-600 text-sm font-sans'>
                              {sub}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return null; // Return null if no subcategories to display
                })()}
              </div>
            ))}
          </div>
        </div>
      )}

      <Drawer
        opened={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={isEditing ? 'Edit Category' : 'Add Category'}
        padding='xl'
        size='md'
        position='right'
      >
        <FormProvider {...methods}>
  <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
    <Controller
      name='name'
      control={methods.control}
      rules={{ required: 'Category name is required' }}
      render={({ field }) => (
        <Input
          {...field}
          label='Category Name'
          placeholder='Enter category name'
        />
      )}
    />
    <Controller
      name='description'
      control={methods.control}
      render={({ field }) => (
        <Input
          {...field}
          label='Description (Optional)'
          placeholder='Enter category description'
          type='textarea'
          rows={4}
        />
      )}
    />
    {/* Subcategories Input */}
    <Controller
      name='subcategories'
      control={methods.control}
      render={({ field }) => (
        <Input
          {...field}
          label='Subcategories (Optional)'
          placeholder='Enter subcategories, separated by commas'
          type='textarea'
          rows={3}
        />
      )}
    />
    <div className='flex justify-end gap-4 mt-6'>
      <Button
        type='submit'
        variant='filled'
        color='#1D9B5E'
        radius='md'
        size='sm'
      >
        {isEditing ? 'Update' : 'Create'} Category
      </Button>
    </div>
  </form>
</FormProvider>
      </Drawer>
      <Modal
        opened={deleteModalOpen}
        className='font-sans'
        onClose={() => { setDeleteModalOpen(false); setCategoryToDelete(null); }}
        title={<Text fw={600} size='lg'>Delete Category</Text>}
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
              This action cannot be undone. The category will be permanently removed.
            </Text>
          </div>
        </div>
        <div className='flex justify-end gap-2 mt-4'>
          <Button
            color='red'
            onClick={confirmDeleteCategory}
            radius='md'
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
