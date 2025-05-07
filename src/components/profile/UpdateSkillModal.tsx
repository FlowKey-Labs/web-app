import { Modal, Button, Group } from '@mantine/core';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import Input from '../common/Input';
import { Subcategory, Skill } from '../../types/profileCategories';
import { useEffect } from 'react';

type SkillFormData = {
  skills: Array<{
    id?: number;
    name: string;
    description: string;
  }>;
  subcategory: number;
};

const UpdateSkillModal = ({
  opened,
  onClose,
  onSubmit,
  subcategory,
  skills,
  isLoading,
  onDeleteSkill,
}: {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: SkillFormData) => Promise<void>;
  subcategory: Subcategory | null;
  skills: Skill[];
  isLoading: boolean;
  onDeleteSkill: (skillId: number) => Promise<void>;
}) => {
  const methods = useForm<SkillFormData>({
    defaultValues: {
      skills: skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description || '',
      })),
      subcategory: subcategory?.id || 0,
    },
  });

  useEffect(() => {
    if (opened && subcategory) {
      methods.reset({
        skills: skills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          description: skill.description || '',
        })),
        subcategory: subcategory.id,
      });
    }
  }, [opened, subcategory, skills]);

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await onDeleteSkill(skillId);
      const currentSkills = methods.getValues('skills');
      methods.reset({
        skills: currentSkills.filter((skill) => skill.id !== skillId),
        subcategory: subcategory?.id || 0,
      });
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title='Edit Skills'
      centered
      radius='md'
      size='lg'
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-6'>
          {methods.watch('skills').map((skill, index) => (
            <div
              key={skill.id || index}
              className='relative border border-gray-200 bg-cardsBg p-4 pt-8 rounded-lg'
            >
              {skill.id && (
                <button
                  type='button'
                  onClick={() => handleDeleteSkill(skill.id!)}
                  className='absolute top-2 right-2 z-10 text-red-500 hover:text-red-700 rounded-full p-1 border border-red-500 bg-white'
                  disabled={isLoading}
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
                control={methods.control}
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
                  />
                )}
              />

              <Controller
                name={`skills.${index}.description`}
                control={methods.control}
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
            {...methods.register('subcategory')}
            value={subcategory?.id || 0}
          />

          <Group justify='flex-end'>
            <Button
              type='submit'
              variant='filled'
              color='#1D9B5E'
              radius='md'
              size='sm'
              loading={isLoading}
            >
              Update Skills
            </Button>
          </Group>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default UpdateSkillModal;
