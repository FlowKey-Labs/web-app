import { Button, Stack, Switch } from '@mantine/core';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import Input from '../../common/Input';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import successIcon from '../../../assets/icons/success.svg';
import errorIcon from '../../../assets/icons/error.svg';
import {
  useCreateClassType,
  useUpdateClassType,
  useGetClassType,
} from '../../../hooks/reactQuery';
import { ClassType } from '../../../types/sessionTypes';

interface ClassTypeFormProps {
  classTypeId?: string;
  onSuccess?: () => void;
}

type ClassTypeFormData = Omit<ClassType, 'created_at' | 'updated_at'>;

export const ClassTypeForm = ({
  classTypeId,
  onSuccess,
}: ClassTypeFormProps) => {
  const { data: classType, isLoading: isLoadingClassType } =
    useGetClassType(classTypeId);
  const { mutateAsync: createClassType, isPending: isCreating } =
    useCreateClassType();
  const { mutateAsync: updateClassType, isPending: isUpdating } =
    useUpdateClassType();

  const isLoading = isLoadingClassType || isCreating || isUpdating;

  const methods = useForm<ClassTypeFormData>({
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
    },
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    if (classType) {
      reset({
        name: classType.name,
        description: classType.description || '',
        is_active: classType.is_active,
      });
    } else if (!classTypeId) {
      reset({
        name: '',
        description: '',
        is_active: true,
      });
    }
  }, [classType, classTypeId, reset]);

  const onSubmit = async (formData: ClassTypeFormData) => {
    try {
      if (classTypeId) {
        await updateClassType({
          id: classTypeId,
          classTypeData: formData,
        });
      } else {
        await createClassType(formData);
      }

      notifications.show({
        color: 'green',
        title: 'Success',
        message: `Class type ${
          classTypeId ? 'updated' : 'created'
        } successfully`,
        icon: <img src={successIcon} alt='Success' />,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error saving class type:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Failed to ${classTypeId ? 'update' : 'create'} class type`,
        icon: <img src={errorIcon} alt='Error' />,
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap='md'>
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label='Name'
                placeholder='Enter class type name'
                validation={{ required: 'Name is required' }}
                disabled={isLoading}
              />
            )}
          />

          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label='Description'
                placeholder='Enter description (optional)'
                type='textarea'
                rows={3}
                disabled={isLoading}
              />
            )}
          />

          <Controller
            name='is_active'
            control={control}
            render={({ field }) => (
              <div className='flex items-center gap-2'>
                <Switch
                  checked={field.value}
                  onChange={(event) =>
                    field.onChange(event.currentTarget.checked)
                  }
                  disabled={isLoading}
                />
                <span className='text-sm font-medium'>
                  {field.value ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}
          />

          <div className='flex justify-end gap-3 mt-6'>
            <Button
              type='submit'
              loading={isLoading}
              disabled={isLoading}
              size='md'
              color='#1D9B5E'
              radius='md'
            >
              {classTypeId ? 'Update' : 'Create'}
            </Button>
          </div>
        </Stack>
      </form>
    </FormProvider>
  );
};
