import { Accordion } from '@mantine/core';
import { Controller } from 'react-hook-form';
import { SingleValue } from 'react-select';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import Button from '../common/Button';
import Input from '../common/Input';
import DropdownSelectInput, { DropDownItem } from '../common/Dropdown';
import { navigateToStaff } from '../utils/navigationHelpers';

import profileGeneralIcon from '../../assets/icons/profileGeneral.svg';
import greenProfileGeneralIcon from '../../assets/icons/greenProfileGeneral.svg';
import locationIcon from '../../assets/icons/location.svg';
import greenLocationIcon from '../../assets/icons/greenLocation.svg';
import staffIcon from '../../assets/icons/staff.svg';
import grayPhoto from '../../assets/images/greyPhoto.png';
import editIcon from '../../assets/icons/editWhite.svg';
import rightIcon from '../../assets/icons/tableRight.svg';

import {
  cityOptions,
  regionOptions,
  profileRoleOptions,
} from '../utils/dummyData';
import { useNavigate } from 'react-router-dom';

export interface ProfileFormData {
  businessName: string;
  contactPerson: string;
  role: SingleValue<DropDownItem>;
  address: string;
  name: string;
  region: SingleValue<DropDownItem>;
  city: SingleValue<DropDownItem>;
  mobile: string;
  email: string;
  bio: string;
}

interface BusinessInformationProps {
  openedAccordion: string | null;
  setOpenedAccordion: (value: string | null) => void;
  methods: UseFormReturn<ProfileFormData>;
  control: any;
  handleSubmit: any;
  defaultRole: SingleValue<DropDownItem>;
}

const BusinessInformation = ({
  openedAccordion,
  setOpenedAccordion,
  methods,
  control,
  handleSubmit,
}: BusinessInformationProps) => {
  const navigate = useNavigate();

  const onSubmit = (data: ProfileFormData) => {
    console.log(data);
    
  };

  return (
    <div className='w-full space-y-6 bg-white rounded-lg p-6'>
      <Accordion
        transitionDuration={300}
        variant='contained'
        chevronPosition='right'
        radius='md'
        value={openedAccordion}
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
              <p className='text-gray-500 text-sm'>
                Tell us more about your business
              </p>
            </div>
          </Accordion.Control>
          <Accordion.Panel>
            <div className='px-6 py-4'>
              <div className='flex items-center'>
                <FormProvider {...methods}>
                  <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
                    <div className='flex items-center h-[160px]'>
                      <div className='flex flex-col space-y-2 text-center mr-8'>
                        <div className='max-w-[100px] max-h-[100px]'>
                          <div className='relative items-center justify-center p-2 rounded-full'>
                            <img
                              src={grayPhoto}
                              alt='grayPhoto'
                              className='w-[80px] h-[80px] rounded-full object-cover'
                            />
                            <div
                              className='absolute inset-0 rounded-full border-4 border-secondary'
                              style={{
                                clipPath:
                                  'polygon(0% 0%, 50% 20%, 50% 100%, 0% 100%, 0% 75%)',
                              }}
                            ></div>
                            <div className='absolute bg-secondary rounded-full p-2 -right-2 top-1 cursor-pointer'>
                              <img
                                src={editIcon}
                                alt='editIcon'
                                className='w-4 h-4'
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className='text-[16px] font-[600] text-primary'>
                            RayFish School
                          </h3>
                          <p className='text-gray-500 text-sm'>Swim</p>
                        </div>
                      </div>
                      <div className='h-[70%] w-[2px] bg-gray-300'></div>
                      <div className='flex-grow p-6'>
                        <div className='grid grid-cols-2 gap-4 -mt-4'>
                          <Controller
                            name='businessName'
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                name='businessName'
                                label='Business Name'
                                placeholder='Enter business name'
                                type='text'
                              />
                            )}
                          />
                          <Controller
                            name='contactPerson'
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                name='contactPerson'
                                label='Contact Person'
                                placeholder='Enter contact person'
                                type='text'
                              />
                            )}
                          />
                          <Controller
                            name='role'
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <DropdownSelectInput
                                label='Role'
                                options={profileRoleOptions}
                                onSelectItem={(selectedItem) => {
                                  onChange(selectedItem);
                                }}
                                defaultValue={value}
                                placeholder='Select role'
                                singleSelect
                                isMulti={false}
                                isClearable={false}
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
                            name='mobile'
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                name='mobile'
                                label='Mobile'
                                placeholder='Mobile number'
                                type='text'
                              />
                            )}
                          />
                          <Controller
                            name='email'
                            control={control}
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
                                name='email'
                                label='Email'
                                placeholder='Enter email'
                                type='email'
                              />
                            )}
                          />
                          <Controller
                            name='address'
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                name='address'
                                label='Address'
                                placeholder='address'
                                type='text'
                              />
                            )}
                          />
                          <Controller
                            name='region'
                            control={control}
                            render={({ field: { onChange } }) => (
                              <DropdownSelectInput
                                label='Region'
                                options={regionOptions}
                                onSelectItem={(selectedItem) => {
                                  onChange(selectedItem);
                                }}
                                placeholder='Select region'
                                singleSelect
                                isMulti={false}
                                isClearable={false}
                              />
                            )}
                          />
                          <Controller
                            name='city'
                            control={control}
                            render={({ field: { onChange } }) => (
                              <DropdownSelectInput
                                label='City'
                                options={cityOptions}
                                onSelectItem={(selectedItem) => {
                                  onChange(selectedItem);
                                }}
                                placeholder='Select city'
                                singleSelect
                                isMulti={false}
                                isClearable={false}
                              />
                            )}
                          />
                        </div>
                        <div className='mt-6'>
                          <h3 className='text-lg font-[400]'>About Company</h3>
                          <Controller
                            name='bio'
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                name='bio'
                                label=''
                                placeholder='Bio...'
                                type='text'
                                className='h-32'
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
                </FormProvider>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Accordion
        transitionDuration={300}
        variant='contained'
        chevronPosition='right'
        radius='md'
        value={openedAccordion}
        onChange={setOpenedAccordion}
      >
        <Accordion.Item value='location'>
          <Accordion.Control
            icon={
              <div className='rounded-full bg-cardsBg p-2 ml-4'>
                <img
                  src={
                    openedAccordion === 'location'
                      ? greenLocationIcon
                      : locationIcon
                  }
                  alt='locationIcon'
                  className='w-6 h-6'
                />
              </div>
            }
          >
            <div className='flex flex-col gap-1 ml-6'>
              <h3 className='text-primary text-sm font-[600]'>
                Set up your Location
              </h3>
              <p className='text-gray-500 text-sm'>
                Add your business Location, hours of operation, etc
              </p>
            </div>
          </Accordion.Control>
          <Accordion.Panel>
            <div className='px-6 py-4'>
              <div className='flex items-center'>
                <FormProvider {...methods}>
                  <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
                    <div className=''>
                      <h3 className='text-lg font-[400]'>Business Address</h3>
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
                </FormProvider>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <div
        className='flex justify-between items-center rounded-lg p-4 border cursor-pointer hover:bg-gray-50'
        onClick={() => navigateToStaff(navigate)}
      >
        <div className='flex gap-4 items-center'>
          <div className='rounded-full bg-cardsBg p-2 flex items-center justify-center w-10 h-10 ml-4'>
            <img src={staffIcon} alt='staffIcon' className='w-6 h-6' />
          </div>

          <div className='flex flex-col gap-1'>
            <h3 className='text-primary text-sm font-[600]'>Add your Staff</h3>
            <p className='text-gray-500 text-sm'>
              Get your employees set up on FlowKey
            </p>
          </div>
        </div>

        <img src={rightIcon} alt='right arrow' className='w-4 h-4' />
      </div>
    </div>
  );
};

export default BusinessInformation;
