import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Group,
  Badge,
  Menu,
  Drawer,
  Modal,
  Text,
  Stack,
} from '@mantine/core';
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
import { useExportSubcategories } from '../../hooks/useExport';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { IconPlus } from '@tabler/icons-react';

import CreateSkillModal from './CreateSkillModal';
import UpdateSkillModal from './UpdateSkillModal';
import { Subcategory, Skill, Category } from '../../types/profileCategories';

type SkillFormData = {
  skills: Array<{
    id?: number;
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

  const [currentSubcategoryForSkill, setCurrentSubcategoryForSkill] =
    useState<Subcategory | null>(null);

  const [isCreateSkillModalOpen, setIsCreateSkillModalOpen] = useState(false);
  const [isUpdateSkillModalOpen, setIsUpdateSkillModalOpen] = useState(false);
  const [currentSkills, setCurrentSkills] = useState<Skill[]>([]);

  const [selectedRowData, setSelectedRowData] = useState<Subcategory | null>(
    null
  );
  const [isRowDetailModalOpen, setIsRowDetailModalOpen] = useState(false);

  const [rowSelection, setRowSelection] = useState({});

  const getSelectedSubcategoryIds = useCallback(() => {
    if (!allSubcategories) return [];

    return Object.keys(rowSelection).map((index) => {
      const subcategoryIndex = parseInt(index);
      return allSubcategories[subcategoryIndex].id;
    });
  }, [rowSelection, allSubcategories]);

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportSubcategories(allSubcategories || [], allSkills || []);

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

  useFieldArray({
    control: addSkillMethods.control,
    name: 'skills',
  });

  const handleAddSkill = (subcategory: Subcategory) => {
    if (!subcategory?.id) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Invalid subcategory selected',
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
      return;
    }

    setCurrentSubcategoryForSkill(subcategory);
    setIsCreateSkillModalOpen(true);
  };

  const handleEditSkill = (skills: Skill[]) => {
    if (!skills.length) return;
    setCurrentSubcategoryForSkill(
      allSubcategories?.find(
        (sub: Subcategory) => sub.id === skills[0].subcategory
      ) || null
    );
    setCurrentSkills(skills);
    setIsUpdateSkillModalOpen(true);
  };

  const onSubmitAddSkill = async (formData: SkillFormData) => {
    if (!currentSubcategoryForSkill?.id) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'No subcategory selected',
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
      return;
    }

    setIsSubmitting(true);
    try {
      const createPromises = formData.skills.map((skill) =>
        createSkill({
          name: skill.name,
          description: skill.description,
          subcategory: currentSubcategoryForSkill.id,
        })
      );

      await Promise.all(createPromises);

      notifications.show({
        color: 'green',
        title: 'Success',
        message: `${formData.skills.length} skill${
          formData.skills.length > 1 ? 's' : ''
        } created successfully`,
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

      setIsCreateSkillModalOpen(false);
      refetchSkills();
    } catch (error) {
      console.error('Error saving skills:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to create skills. Please try again.',
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

  const onSubmitUpdateSkill = async (formData: SkillFormData) => {
    if (!currentSubcategoryForSkill?.id) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'No subcategory selected',
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
      return;
    }

    setIsSubmitting(true);
    try {
      const updatePromises = formData.skills.map((skill) => {
        if (skill.id) {
          return updateSkill({
            id: skill.id,
            name: skill.name,
            description: skill.description,
            subcategory: currentSubcategoryForSkill.id,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Skills updated successfully',
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
      setIsUpdateSkillModalOpen(false);
      refetchSkills();
    } catch (error) {
      console.error('Error updating skills:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to update skills. Please try again.',
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

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await deleteSkill({ id: skillId });
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Skill deleted successfully',
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
      refetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to delete skill. Please try again.',
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

  const RowDetailModal = () => (
    <Modal
      opened={isRowDetailModalOpen}
      onClose={() => setIsRowDetailModalOpen(false)}
      title={
        <Text size='xl' fw={600} className='text-gray-800'>
          Subcategory Details
        </Text>
      }
      size='lg'
      centered
      radius='md'
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      classNames={{
        header: 'pb-4 mb-4',
        body: 'pt-6',
      }}
    >
      {selectedRowData && (
        <div className='space-y-6'>
          <div className='flex items-start gap-4'>
            <div className='bg-[#F0FDF4] p-3 rounded-full'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6 text-[#1D9B5E]'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
            </div>
            <div>
              <Text size='lg' fw={600} className='text-gray-800'>
                {selectedRowData.name}
              </Text>
            </div>
          </div>

          {/* Details in card layout */}
          <div className='bg-cardsBg p-4 rounded-lg space-y-4'>
            <div>
              <Text
                size='sm'
                fw={500}
                c='dimmed'
                style={{ marginBottom: '4px' }}
              >
                Description
              </Text>
              <Text className='text-gray-800'>
                {selectedRowData.description || (
                  <span className='text-gray-400'>No description provided</span>
                )}
              </Text>
            </div>

            <div>
              <Text
                size='sm'
                fw={500}
                c='dimmed'
                style={{ marginBottom: '4px' }}
              >
                Associated Skills
              </Text>
              {subcategorySkillsMap.get(selectedRowData.id)?.length ? (
                <div className='flex flex-wrap gap-2'>
                  {subcategorySkillsMap
                    .get(selectedRowData.id)
                    ?.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant='light'
                        color='#1D9B5E'
                        radius='sm'
                        className='px-3 py-1'
                      >
                        <div className='flex items-center gap-1'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                          {skill.name}
                        </div>
                      </Badge>
                    ))}
                </div>
              ) : (
                <div className='flex items-center gap-2 text-gray-400'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                    />
                  </svg>
                  <Text>No skills associated with this subcategory</Text>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-cardsBg p-4 rounded-lg border border-gray-200'>
              <Text size='sm' c='dimmed'>
                Category
              </Text>
              <Text fw={600} className='mt-1'>
                {category?.name || 'N/A'}
              </Text>
            </div>
            <div className='bg-cardsBg p-4 rounded-lg border border-gray-200'>
              <Text size='sm' c='dimmed'>
                Skills Count
              </Text>
              <Text fw={600} className='mt-1'>
                {subcategorySkillsMap.get(selectedRowData.id)?.length || 0}
              </Text>
            </div>
          </div>

          {/* Action buttons */}
          <Group
            justify='flex-end'
            mt='xl'
            className='border-t border-gray-200 pt-4'
          >
            <Button
              variant='outline'
              color='red'
              radius='md'
              size='md'
              onClick={() => setIsRowDetailModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant='filled'
              color='#1D9B5E'
              radius='md'
              size='md'
              leftSection={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
              }
              onClick={() => {
                setIsRowDetailModalOpen(false);
                handleEditSubcategory(selectedRowData);
              }}
            >
              Edit
            </Button>
          </Group>
        </div>
      )}
    </Modal>
  );

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
            onClick={(e) => e.stopPropagation()}
            onChange={row.getToggleSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
      }),
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
                    Export Subcategories
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>
        ),
        cell: ({ row }) => {
          const subcategory = row.original;
          return (
            <div className='flex' onClick={(e) => e.stopPropagation()}>
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
                      color='#1D9B5E'
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
                      color='#1D9B5E'
                      leftSection={
                        <img src={editIcon} alt='Edit' className='w-4 h-4' />
                      }
                      onClick={() => {
                        const skills =
                          subcategorySkillsMap.get(subcategory.id) || [];
                        if (skills.length > 0) {
                          handleEditSkill(skills);
                        }
                      }}
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

      <div className='w-[20%] border rounded-lg border-gray-200 p-6 pt-16 overflow-y-auto bg-cardsBg shadow-sm h-[28vh]'>
        <h2 className='text-xl font-semibold mb-3 text-gray-800 font-sans'>
          {category?.name}
        </h2>
        <p className='text-gray-600 text-sm mb-6 font-sans'>
          {category?.description || 'No description available.'}
        </p>
      </div>

      <div className='w-[80%] px-6 pb-6 overflow-y-auto'>
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
            leftSection={<IconPlus size={16} />}
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
          <Table
            data={subcategories}
            columns={columns}
            pageSize={8}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onRowClick={(row) => {
              setSelectedRowData(row);
              setIsRowDetailModalOpen(true);
            }}
          />
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

      <CreateSkillModal
        opened={isCreateSkillModalOpen}
        onClose={() => setIsCreateSkillModalOpen(false)}
        onSubmit={onSubmitAddSkill}
        subcategory={currentSubcategoryForSkill}
        isLoading={isSubmitting}
      />

      <UpdateSkillModal
        opened={isUpdateSkillModalOpen}
        onClose={() => setIsUpdateSkillModalOpen(false)}
        onSubmit={onSubmitUpdateSkill}
        subcategory={currentSubcategoryForSkill}
        skills={currentSkills}
        isLoading={isSubmitting}
        onDeleteSkill={handleDeleteSkill}
      />
      <Modal
        opened={exportModalOpened}
        onClose={closeExportModal}
        title={
          <Text fw={600} size='lg'>
            Export Subcategories
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
            selected subcategories
          </Text>

          <Stack gap='md'>
            <Button
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => handleExport('excel', getSelectedSubcategoryIds())}
              className='px-6'
              loading={isExporting}
            >
              Export as Excel
            </Button>

            <Button
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => handleExport('csv', getSelectedSubcategoryIds())}
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
      <RowDetailModal />
    </div>
  );
};

export default CategoryDetails;
