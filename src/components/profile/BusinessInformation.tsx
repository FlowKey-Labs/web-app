import { Accordion } from '@mantine/core';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

import Button from '../common/Button';
import Input from '../common/Input';
import {
  useUpdateBusinessProfile,
  useGetBusinessProfile,
} from '../../hooks/reactQuery';

import profileGeneralIcon from '../../assets/icons/profileGeneral.svg';
import greenProfileGeneralIcon from '../../assets/icons/greenProfileGeneral.svg';
import grayPhoto from '../../assets/images/greyPhoto.png';
import editIcon from '../../assets/icons/editWhite.svg';

export interface ProfileFormData {
  business_name: string;
  contact_person: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  about: string;
}

interface BusinessInformationProps {
  openedAccordion: string | null;
  setOpenedAccordion: (value: string | null) => void;
}

const BusinessInformation = ({
  openedAccordion,
  setOpenedAccordion,
}: BusinessInformationProps) => {
  const { data: businessProfile, isLoading } = useGetBusinessProfile();

  const methods = useForm<ProfileFormData>({
    defaultValues: {
      business_name: '',
      contact_person: '',
      address: '',
      contact_phone: '',
      contact_email: '',
      about: '',
    },
  });

  const updateProfile = useUpdateBusinessProfile();

  useEffect(() => {
    if (businessProfile?.[0]) {
      methods.reset({
        business_name: businessProfile[0].business_name || '',
        contact_person: businessProfile[0].contact_person || '',
        address: businessProfile[0].address || '',
        contact_phone: businessProfile[0].contact_phone || '',
        contact_email: businessProfile[0].contact_email || '',
        about: businessProfile[0].about || '',
      });
    }
  }, [businessProfile, methods]);

  const onSubmit = (data: ProfileFormData) => {
    if (!businessProfile?.[0]?.id) {
      console.error('No business profile ID found');

      notifications.show({
        title: 'Error',
        message: 'Business profile not found. Please try again.',
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
      return;
    }

    updateProfile.mutate(
      {
        id: businessProfile[0].id.toString(),
        updateData: {
          business_name: data.business_name,
          contact_person: data.contact_person,
          address: data.address,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
          about: data.about,
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Business profile updated successfully!',
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
        },
        onError: (error) => {
          console.error('Update failed:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to update business profile. Please try again.',
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
        },
      }
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='w-full space-y-6 bg-white rounded-lg p-6'>
      <FormProvider {...methods}>
        <Accordion
          transitionDuration={300}
          variant='contained'
          chevronPosition='right'
          radius='md'
          defaultValue='general'
          onChange={setOpenedAccordion}
        >
          <Accordion.Item value='general'>
            <Accordion.Control
              icon={
                <div className='rounded-full bg-cardsBg p-2 ml-4'>
                  <img
                    src={
                      openedAccordion === 'general'
                        ? greenProfileGeneralIcon
                        : profileGeneralIcon
                    }
                    alt='profileGeneralIcon'
                    className='w-6 h-6'
                  />
                </div>
              }
            >
              <div className='flex flex-col gap-1 ml-6'>
                <h3 className='text-primary text-sm font-[600]'>
                  General Information
                </h3>
                <p className='text-gray-500 text-sm font-sans'>
                  Tell us more about your business
                </p>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='px-6 py-4'>
                <div className='flex items-center'>
                  <form
                    onSubmit={methods.handleSubmit(onSubmit)}
                    className='w-full'
                  >
                    <div className='flex items-center h-[160px] font-sans'>
                      <div className='flex flex-col space-y-2 text-center mr-8 font-sans'>
                        <div className='max-w-[100px] max-h-[100px]'>
                          <div className='flex items-center justify-center w-[80px] h-[80px] rounded-full bg-secondary text-white text-3xl font-bold select-none mx-auto'>
                            {(() => {
                              const name = methods.getValues('business_name')?.trim() || '';
                              if (!name) return 'BN';
                              const words = name.split(' ').filter(Boolean);
                              if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
                              return (
                                words[0][0] + words[1][0]
                              ).toUpperCase();
                            })()}
                          </div>
                        </div>
                        <div>
                          <h3 className='text-[16px] font-[600] text-primary font-sans'>
                            {methods.getValues('business_name') || 'Add Business Name'}
                          </h3>
                          <p className='text-gray-500 text-sm font-sans'>
                            {methods.getValues('about') || 'Add About'}
                          </p>
                        </div>
                      </div>
                      <div className='h-[70%] w-[2px] bg-gray-300'></div>
                      <div className='flex-grow p-6'>
                        <div className='grid grid-cols-2 gap-4 -mt-4'>
                          <Controller
                            name='business_name'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                name='business_name'
                                label='Business Name'
                                placeholder='Enter business name'
                                type='text'
                              />
                            )}
                          />
                          <Controller
                            name='contact_person'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                name='contact_person'
                                label='Contact Person'
                                placeholder='Enter contact person'
                                type='text'
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <div className='mt-6'>
                      <h3 className='text-lg font-[400]'>
                        Contact Information
                      </h3>
                      <div className='flex-grow'>
                        <div className='grid grid-cols-3 gap-4'>
                          <Controller
                            name='contact_phone'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                name='contact_phone'
                                label='Contact Phone'
                                placeholder='Enter phone number'
                                type='text'
                              />
                            )}
                          />
                          <Controller
                            name='contact_email'
                            control={methods.control}
                            rules={{
                              pattern: {
                                value:
                                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email format',
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                name='contact_email'
                                label='Contact Email'
                                placeholder='Enter email'
                                type='email'
                              />
                            )}
                          />
                        </div>
                        <div className='mt-6'>
                          <h3 className='text-lg font-[400]'>About Company</h3>
                          <Controller
                            name='about'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                name='about'
                                label='About'
                                placeholder='Tell us about your business'
                                type='textarea'
                                rows={4}
                              />
                            )}
                          />
                        </div>
                      </div>
                      <div className='flex py-4 mt-4 gap-6 justify-end'>
                        <Button
                          size='sm'
                          radius='md'
                          type='button'
                          variant='outline'
                          color='red'
                          onClick={() => {}}
                        >
                          Cancel
                        </Button>
                        <Button
                          size='sm'
                          radius='md'
                          type='submit'
                          color='#1D9B5E'
                        >
                          Save & Continue
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </FormProvider>
    </div>
  );
};

export default BusinessInformation;
