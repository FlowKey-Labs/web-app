import cancelIcon from '../../assets/icons/cancel.svg';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import Input from '../common/Input';
import DropdownSelectInput from '../common/Dropdown';
import Button from '../common/Button';
import clientlocationIcons from '../../assets/icons/clientLocation.svg';
import { months, swimClasses } from '../../utils/dummyData';
import { useAddClient } from '../../hooks/reactQuery';
import React from 'react';
import { AddClient } from '../../types/clientTypes';

interface ClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClientsModal = ({ isOpen, onClose }: ClientsModalProps) => {
  const methods = useForm<AddClient>({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      location: '',
      assigned_classes: 0,
    },
  });
  const { control, handleSubmit, reset } = methods;

  const { mutate: addClient, isPending, isSuccess } = useAddClient();

  const days = Array.from({ length: 31 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString().padStart(2, '0'),
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({
    label: (currentYear - i).toString(),
    value: (currentYear - i).toString(),
  }));

  // Reset form and close modal on successful submission
  React.useEffect(() => {
    if (isSuccess) {
      reset();
      onClose();
    }
  }, [isSuccess, reset, onClose]);

  const onSubmit = (data: AddClient) => {
    addClient({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_number: data.phone_number,
      location: data.location,
      assigned_classes: data.assigned_classes,
      id: 0,
      active: false,
      created_at: '',
      created_by: 0,
      business: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end'
      onClick={onClose}
    >
      <div
        className='w-2/5 h-screen bg-white p-4 flex flex-col items-center overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='absolute top-4 right-4'>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100'
          >
            <img src={cancelIcon} alt='Cancel' className='w-6 h-6' />
          </button>
        </div>

        <div className='w-[90%] h-full flex flex-col'>
          <h3 className='px-2 mt-4 text-primary font-bold text-[24px]'>
            Create New Client
          </h3>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='flex-1 flex flex-col p-2'
            >
              <div className='space-y-4 mb-8'>
                <h4 className='text-lg font-semibold text-gray-700'>
                  Personal Information
                </h4>

                <div className='grid grid-cols-2 gap-4'>
                  <Controller
                    name='first_name'
                    control={control}
                    rules={{ required: 'First name is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label='First Name'
                        placeholder='Enter first name'
                      />
                    )}
                  />
                  <Controller
                    name='last_name'
                    control={control}
                    rules={{ required: 'Last name is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label='Last Name'
                        placeholder='Enter last name'
                      />
                    )}
                  />
                </div>

                <Controller
                  name='phone_number'
                  control={control}
                  rules={{
                    pattern: {
                      value:
                        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
                      message: 'Invalid phone number',
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Phone Number'
                      placeholder='Enter phone number'
                      type='tel'
                    />
                  )}
                />

                <Controller
                  name='email'
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Email Address'
                      placeholder='Enter email'
                      type='email'
                    />
                  )}
                />

                <Controller
                  name='location'
                  control={control}
                  render={({ field }) => (
                    <div className='relative'>
                      <Input
                        {...field}
                        label='Location'
                        placeholder='Enter location'
                        className='pr-10'
                      />
                      <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                        <img
                          src={clientlocationIcons}
                          alt=''
                          className='w-5 h-5 text-gray-400'
                        />
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* <div className='mb-8'>
                <div className='grid grid-cols-3 gap-4'>
                  <Controller
                    name='month'
                    control={control}
                    render={({ field }) => (
                      <DropdownSelectInput
                        label='Month'
                        placeholder='Jan'
                        options={months}
                        onSelectItem={(selected) =>
                          field.onChange(selected.value)
                        }
                      />
                    )}
                  />
                  <Controller
                    name='day'
                    control={control}
                    render={({ field }) => (
                      <DropdownSelectInput
                        label='Day'
                        placeholder='09'
                        options={days}
                        onSelectItem={(selected) =>
                          field.onChange(selected.value)
                        }
                      />
                    )}
                  />
                  <Controller
                    name='year'
                    control={control}
                    render={({ field }) => (
                      <DropdownSelectInput
                        label='Year'
                        placeholder='1975'
                        options={years}
                        onSelectItem={(selected) =>
                          field.onChange(selected.value)
                        }
                      />
                    )}
                  />
                </div>
              </div> */}

              <div className='mb-8'>
                <Controller
                  name='assigned_classes'
                  control={control}
                  render={({ field }) => (
                    <DropdownSelectInput
                      label='Assign Class'
                      placeholder='Select class'
                      options={swimClasses}
                      onSelectItem={(selected) =>
                        field.onChange(selected.value)
                      }
                    />
                  )}
                />
              </div>

              <div className='mt-auto flex justify-end gap-4'>
                <Button
                  type='submit'
                  color='#1D9B5E'
                  radius='8px'
                  className='w-full md:w-auto'
                  disabled={isPending}
                >
                  {isPending ? 'Creating...' : 'Continue'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default ClientsModal;
