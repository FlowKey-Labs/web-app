import { useParams } from 'react-router-dom';
import { data } from '../utils/dummyData';
import MembersHeader from '../headers/MembersHeader';
import Button from '../common/Button';
import { Switch } from '@mantine/core';

import plusIcon from '../../assets/icons/plus.svg';
import avatar from '../../assets/images/staffImage.jpg';
import editIcon from '../../assets/icons/edit.svg';
import { useState } from 'react';

const StaffDetails = () => {
  const { id } = useParams();
  const staffId = id;
  const [checked, setChecked] = useState(true);

  const staffDetails = data.find((s) => s.id.toString() === staffId);

  if (!staffDetails) {
    return (
      <div className='p-8'>
        <h2 className='text-[40px] font-bold text-primary'>Staff not found</h2>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-[#0F2028]'>
      <div className='flex flex-col min-h-screen bg-white w-full rounded-l-[36px] pl-16'>
        <MembersHeader
          title='Staff Details'
          buttonText='New Class'
          searchPlaceholder='Search by ID, Name or Subject'
          buttonIcon={plusIcon}
          showFilterIcons={false}
          showButton={false}
          showSearch={false}
        />
        <div className='flex flex-col justify-center items-center mt-10 space-y-4'>
          <div className='border items-center rounded-xl w-[95%] p-8'>
            <div className='flex justify-between'>
              <div className='flex justify-center items-center gap-4'>
                <img
                  src={avatar}
                  alt='avatar'
                  className='rounded-full w-12 h-12 object-cover'
                />
                <div className='text-primary space-y-1'>
                  <p className='text-sm font-semibold'>{staffDetails.name}</p>
                  <p className='text-xs text-gray-400 font-semibold'>
                    {staffDetails.role}
                  </p>
                  <p className='text-xs text-gray-400'>
                    ID: {staffDetails.idNumber}
                  </p>
                </div>
              </div>
              <Button
                variant='outline'
                color='gray'
                radius='md'
                h='40'
                leftSection={
                  <img src={editIcon} alt='edit' className='w-4 h-4' />
                }
                size='sm'
              >
                Edit
              </Button>
            </div>
          </div>

          <div className='border rounded-xl w-[95%] p-8'>
            <div className='flex justify-between items-start'>
              <h3 className=' text-primary text-sm font-semibold mb-4'>
                Personal Information
              </h3>
              <Button
                variant='outline'
                color='gray'
                radius='md'
                h='40'
                leftSection={
                  <img src={editIcon} alt='edit' className='w-4 h-4' />
                }
                size='sm'
              >
                Edit
              </Button>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-400'>First Name</p>
                <p className='text-sm text-gray-500'>
                  {staffDetails.firstName}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-400'>Last Name</p>
                <p className='text-sm text-gray-500'>{staffDetails.lastName}</p>
              </div>
              <div>
                <p className='text-sm text-gray-400'>Email Address</p>
                <p className='text-sm text-gray-500'>{staffDetails.email}</p>
              </div>
              <div>
                <p className='text-sm text-gray-400'>Phone Number</p>
                <p className='text-sm text-gray-500'>
                  {staffDetails.phoneNumber}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-400'>Primary Job</p>
                <p className='text-sm text-gray-500'>{staffDetails.role}</p>
              </div>
            </div>
          </div>

          <div className='border rounded-xl w-[95%] p-8'>
            <div className='flex justify-between items-start'>
              <h3 className=' text-primary text-sm font-semibold mb-4'>
                Permissions
              </h3>
              <Button
                variant='outline'
                color='gray'
                radius='md'
                h='40'
                leftSection={
                  <img src={editIcon} alt='edit' className='w-4 h-4' />
                }
                size='sm'
              >
                Edit
              </Button>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex gap-4'>
                <Switch
                  size='xs'
                  style={{ marginTop: '4px' }}
                  onChange={(event) => setChecked(event.currentTarget.checked)}
                />
                <div className='text-sm text-gray-400'>
                  <p className='font-bold'>Add new Client</p>
                  <p className='text-xs'>
                    Add new classes, appointments and personal appointments
                  </p>
                </div>
              </div>
              <div className='flex gap-4'>
                <Switch
                  size='xs'
                  style={{ marginTop: '4px' }}
                  onChange={(event) => setChecked(event.currentTarget.checked)}
                />
                <div className='text-sm text-gray-400'>
                  <p className='font-bold'>Create and send clients invoices</p>
                  <p className='text-xs'>
                    Generate payment receipts and confirm transactions
                  </p>
                </div>
              </div>
              <div className='flex gap-4'>
                <Switch
                  color='#1D9B5E'
                  checked={checked}
                  size='xs'
                  style={{ marginTop: '4px' }}
                  onChange={(event) => setChecked(event.currentTarget.checked)}
                />
                <div className='text-sm text-gray-400'>
                  <p className='font-bold'>Create new events</p>
                  <p className='text-xs'>Onboard new clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails;
