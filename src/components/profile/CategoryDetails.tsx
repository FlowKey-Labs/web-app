import { useMemo, useState } from 'react';
import { Button, Group, Badge, Menu, Drawer, Modal, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import editIcon from '../../assets/icons/edit.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import actionOptionIcon from '../../assets/icons/actionOption.svg';
import plusIcon from '../../assets/icons/plusBlack.svg';
import {
  useGetSessionCategories,
  useGetSessionSubCategories,
  useGetSessionSkills,
  useCreateSessionSubCategory,
  useUpdateSessionSubCategory,
  useDeleteSessionSubCategory,
  useCreateSessionSkill,
  useUpdateSessionSkill,
  useDeleteSessionSkill,
} from '../../hooks/reactQuery';
import Table from '../common/Table';
import { Controller, FormProvider, useFieldArray } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import Input from '../common/Input';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

type Subcategory = {
  id: number;
  name: string;
  description?: string;
  category: number;
};

type Skill = {
  id: number;
  name: string;
  subcategory: number;
  description?: string;
};

type Category = {
  id: number;
  name: string;
  description?: string;
};

type SkillFormData = {
  skills: Array<{
    name: string;
    description: string;
  }>;
  subcategory: number;
};

const columnHelper = createColumnHelper<Subcategory>();

const CategoryDetails = ({
  categoryId,
  onBack,
}: {
  categoryId: number;
  onBack: () => void;
}) => {
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetSessionCategories();
  const {
    data: allSubcategories,
    isLoading: isLoadingSubcategories,
    refetch: refetchSubcategories,
  } = useGetSessionSubCategories();
  const { mutateAsync: createSubcategory } = useCreateSessionSubCategory();
  const { mutateAsync: updateSubcategory } = useUpdateSessionSubCategory();
  const { mutateAsync: deleteSubcategory } = useDeleteSessionSubCategory();
  const {
    data: allSkills,
    isLoading: isLoadingSkills,
    refetch: refetchSkills,
  } = useGetSessionSkills();
  const { mutateAsync: createSkill } = useCreateSessionSkill();
  const { mutateAsync: updateSkill } = useUpdateSessionSkill();
  const { mutateAsync: deleteSkill } = useDeleteSessionSkill();

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [currentSubcategoryForSkill, setCurrentSubcategoryForSkill] =
    useState<Subcategory | null>(null);

  const methods = useForm<Subcategory>({
    defaultValues: {
      id: 0,
      name: '',
      description: '',
      category: categoryId,
    },
  });

  const { reset } = methods;

  const category: Category | undefined = useMemo(
    () => categoriesData?.find((cat: Category) => cat.id === categoryId),
    [categoriesData, categoryId]
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubcategory, setCurrentSubcategory] =
    useState<Subcategory | null>(null);
  const [subcategoryToDelete, setSubcategoryToDelete] =
    useState<Subcategory | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subcategories: Subcategory[] = useMemo(
    () =>
      Array.isArray(allSubcategories)
        ? allSubcategories.filter(
            (sub: Subcategory) => sub.category === categoryId
          )
        : [],
    [allSubcategories, categoryId]
  );

  const subcategorySkillsMap = useMemo(() => {
    const map = new Map<number, Skill[]>();
    if (!allSkills) return map;

    allSkills.forEach((skill: Skill) => {
      if (!map.has(skill.subcategory)) {
        map.set(skill.subcategory, []);
      }
      map.get(skill.subcategory)?.push(skill);
    });

    return map;
  }, [allSkills]);

  const handleAddSubcategory = () => {
    reset({
      id: 0,
      name: '',
      description: '',
      category: categoryId,
    });
    setIsEditing(false);
    setCurrentSubcategory(null);
    setIsDrawerOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    reset({
      id: subcategory.id,
      name: subcategory.name,
      description: subcategory.description || '',
      category: categoryId,
    });
    setIsEditing(true);
    setCurrentSubcategory(subcategory);
    setIsDrawerOpen(true);
  };

  const handleDeleteSubcategory = (subcategory: Subcategory) => {
    setSubcategoryToDelete(subcategory);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSubcategory = async () => {
    if (!subcategoryToDelete) return;
    try {
      await deleteSubcategory({ id: subcategoryToDelete.id });
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Subcategory deleted successfully',
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
      setIsDeleteModalOpen(false);
      setSubcategoryToDelete(null);
      refetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to delete subcategory. Please try again.',
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
      setIsDeleteModalOpen(false);
      setSubcategoryToDelete(null);
      refetchSubcategories();
    }
  };

  const onSubmit = async (formData: Subcategory) => {
    try {
      if (isEditing && currentSubcategory) {
        await updateSubcategory({
          ...formData,
          category: categoryId,
        });
        notifications.show({
          color: 'green',
          title: 'Success',
          message: 'Subcategory updated successfully',
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
          category: categoryId,
        });
        notifications.show({
          color: 'green',
          title: 'Success',
          message: 'Subcategory created successfully',
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
      refetchSubcategories();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to save subcategory. Please try again.',
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

  const addSkillMethods = useForm<SkillFormData>({
    defaultValues: {
      skills: [{ name: '', description: '' }],
      subcategory: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: addSkillMethods.control,
    name: 'skills',
  });

  const handleAddSkill = (subcategory: Subcategory) => {
    setCurrentSubcategoryForSkill(subcategory);
    addSkillMethods.reset({
      skills: [{ name: '', description: '' }],
      subcategory: subcategory.id,
    });
    setIsSkillModalOpen(true);
  };

  const onSubmitAddSkill = async (formData: SkillFormData) => {
    setIsSubmitting(true);
    try {
      const createPromises = formData.skills.map((skill) =>
        createSkill({
          ...skill,
          subcategory: formData.subcategory,
        })
      );

      await Promise.all(createPromises);

      notifications.show({
        color: 'green',
        title: 'Success',
        message: `${formData.skills.length} skill(s) created successfully`,
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

      setIsSkillModalOpen(false);
      refetchSkills();
    } catch (error) {
      console.error('Error creating skills:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to create some skills. Please try again.',
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
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Subcategory',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.display({
        id: 'skills',
        header: 'Skills',
        cell: ({ row }) => {
          const subcategory = row.original;
          const skills = subcategorySkillsMap.get(subcategory.id) || [];

          return (
            <div className='flex flex-wrap gap-2'>
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant='light'
                    color='#1D9B5E'
                    radius='sm'
                    className='cursor-default'
                  >
                    {skill.name}
                  </Badge>
                ))
              ) : (
                <span className='text-gray-400 text-sm'>No skills</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const subcategory = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Group justify='center'>
                <Menu
                  width={120}
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
                      color='#228be6'
                      leftSection={
                        <img src={editIcon} alt='Edit' className='w-4 h-4' />
                      }
                      onClick={() => handleEditSubcategory(subcategory)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      color='#1D9B5E'
                      leftSection={
                        <img src={plusIcon} alt='Add' className='w-4 h-4' />
                      }
                      onClick={() => handleAddSkill(subcategory)}
                    >
                      Add Skills
                    </Menu.Item>
                    <Menu.Item
                      color='#228be6'
                      leftSection={
                        <img src={editIcon} alt='Edit' className='w-4 h-4' />
                      }
                    >
                      Edit Skills
                    </Menu.Item>
                    <Menu.Item
                      color='red'
                      leftSection={
                        <img
                          src={deleteIcon}
                          alt='Delete'
                          className='w-4 h-4'
                        />
                      }
                      onClick={() => handleDeleteSubcategory(subcategory)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </div>
          );
        },
      }),
    ],
    [subcategorySkillsMap]
  );

  const isLoading =
    isLoadingCategories || isLoadingSubcategories || isLoadingSkills;
  const isError = !isLoading && !category;

  if (isLoading) return <div className='p-6 pt-12'>Loading details...</div>;
  if (isError)
    return (
      <div className='p-6 pt-12'>
        Error loading details or category not found.
      </div>
    );

  return (
    <div className='flex relative'>
      <button
        onClick={onBack}
        className='absolute top-5 left-6 text-sm text-secondary hover:underline mb-4 z-10'
      >
        &larr; Back to Categories List
      </button>

      <div className='w-[20%] border rounded-lg border-gray-200 p-6 pt-16 overflow-y-auto bg-white h-[20vh]'>
        <h2 className='text-xl font-semibold mb-3 text-gray-800 font-sans'>
          {category?.name}
        </h2>
        <p className='text-gray-600 text-sm mb-6 font-sans'>
          {category?.description || 'No description available.'}
        </p>
      </div>

      <div className='w-[80%] px-6 overflow-y-auto'>
        <div className='flex justify-between items-center mb-5'>
          <h3 className='text-lg font-semibold text-gray-700 font-sans'>
            Subcategories
          </h3>
          <Button
            onClick={handleAddSubcategory}
            variant='filled'
            color='#1D9B5E'
            radius='md'
            size='sm'
          >
            Add Subcategory
          </Button>
        </div>
        {subcategories.length === 0 ? (
          <div className='text-center py-10 text-gray-500 font-sans bg-white rounded-lg shadow'>
            <p>No subcategories found for this category.</p>
            <Button
              size='sm'
              mt='md'
              variant='outline'
              radius='md'
              color='#1D9B5E'
              onClick={handleAddSubcategory}
            >
              Add Subcategory
            </Button>
          </div>
        ) : (
          <Table data={subcategories} columns={columns} pageSize={8} />
        )}
      </div>

      <Drawer
        opened={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={isEditing ? 'Edit Subcategory' : 'Add Subcategory'}
        padding='xl'
        size='md'
        position='right'
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
            <Controller
              name='name'
              control={methods.control}
              rules={{ required: 'Subcategory name is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label='Subcategory Name'
                  placeholder='Enter subcategory name'
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
                  placeholder='Enter subcategory description'
                  type='textarea'
                  rows={4}
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
                {isEditing ? 'Update' : 'Create'} Subcategory
              </Button>
            </div>
          </form>
        </FormProvider>
      </Drawer>

      <Modal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title='Delete Subcategory?'
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
          <div className='flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center'>
            <img src={errorIcon} alt='Warning' className='w-5 h-5' />
          </div>
          <div>
            <Text fw={500} size='md' mb={8} c='gray.8'>
              Are you sure you want to delete this subcategory?
            </Text>
            <Text size='sm' c='gray.6'>
              This action cannot be undone. The subcategory will be permanently
              removed.
            </Text>
          </div>
        </div>
        <div className='flex justify-end gap-2 mt-4'>
          <Button color='red' onClick={confirmDeleteSubcategory} radius='md'>
            Delete
          </Button>
        </div>
      </Modal>
      {/* modal for creating skill  */}
      <Modal
        opened={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        title='Add New Skills'
        centered
        radius='md'
        size='lg'
      >
        <FormProvider {...addSkillMethods}>
          <form
            onSubmit={addSkillMethods.handleSubmit(onSubmitAddSkill)}
            className='space-y-6'
          >
            {fields.map((field, index) => (
              <div
                key={field.id}
                className='border border-gray-200 bg-cardsBg p-4 rounded-lg relative'
              >
                {fields.length > 1 && (
                  <button
                    type='button'
                    onClick={() => remove(index)}
                    className='absolute top-2 right-2 text-red-500 hover:text-red-700 rounded-full p-1 border border-red-500 '
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                )}

                <Controller
                  name={`skills.${index}.name`}
                  control={addSkillMethods.control}
                  rules={{
                    required: 'Skill name is required',
                    minLength: {
                      value: 3,
                      message: 'Skill name must be at least 3 characters',
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={`Skill Name ${index + 1}`}
                      placeholder='Enter skill name'
                      containerClassName={fields.length > 1 ? 'pt-4' : ''}
                    />
                  )}
                />

                <Controller
                  name={`skills.${index}.description`}
                  control={addSkillMethods.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Description (Optional)'
                      placeholder='Enter skill description'
                      type='textarea'
                      rows={3}
                    />
                  )}
                />
              </div>
            ))}

            <input
              type='hidden'
              {...addSkillMethods.register('subcategory')}
              value={currentSubcategoryForSkill?.id || 0}
            />

            <div className='flex justify-between'>
              <Button
                type='button'
                variant='outline'
                color='blue'
                radius='md'
                size='sm'
                onClick={() => append({ name: '', description: '' })}
              >
                Add Another Skill
              </Button>

              <div className='flex gap-4'>
                <Button
                  type='submit'
                  variant='filled'
                  color='#1D9B5E'
                  radius='md'
                  size='sm'
                  disabled={isSubmitting}
                >
                  Create{' '}
                  {fields.length > 1 ? `${fields.length} Skills` : 'Skill'}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </div>
  );
};

export default CategoryDetails;
