import { JSX, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Button from '../common/Button';
import Header from '../headers/Header';
import Services from './Services';
import Schedule from './Schedule';
import BusinessInformation, { ProfileFormData } from './BusinessInformation';

const schema = yup.object({
  email: yup.string().email('Invalid email'),
});

type TabType = 'business' | 'services' | 'schedule';

const Profile = () => {
  const [openedAccordion, setOpenedAccordion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('business');

  const defaultRole = {
    label: 'Owner',
    value: 'owner',
  };

  const methods: UseFormReturn<ProfileFormData> = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      businessName: 'RayFish School',
      contactPerson: 'Doris Waithera',
      address: '123 Nairobi Estate',
      role: defaultRole,
    },
  });

  // Content map configuration
  const contentMap: Record<TabType, JSX.Element> = {
    business: (
      <BusinessInformation
        openedAccordion={openedAccordion}
        setOpenedAccordion={setOpenedAccordion}
        methods={methods}
        control={methods.control}
        handleSubmit={methods.handleSubmit}
        defaultRole={defaultRole}
      />
    ),
    services: <Services />,
    schedule: <Schedule />,
  };

  const tabConfig = [
    { id: 'business', label: 'Business Information' },
    { id: 'services', label: 'Services' },
    { id: 'schedule', label: 'Schedule' },
  ];

  return (
    <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
      <div className='mt-2'>
        <Header />
      </div>
      <div className='flex-1 p-6'>
        <div className='flex justify-between items-center px-4'>
          <h2 className='text-primary text-[24px] font-[600]'>User Profile</h2>
          <div className='flex gap-6'>
            <Button variant='outline' color='red' radius='md'>
              Cancel
            </Button>
            <Button radius='md' color='#1D9B5E'>
              Save Changes
            </Button>
          </div>
        </div>

        <div className='mt-6 flex gap-6 px-4'>
          {tabConfig.map((tab) => (
            <p
              key={tab.id}
              className={`text-base font-[600] cursor-pointer ${
                activeTab === tab.id ? 'text-secondary' : 'text-primary'
              }`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              {tab.label}
            </p>
          ))}
        </div>

        <div className='mt-6 flex min-h-[350px] w-[95%] px-6'>
          {contentMap[activeTab]}
        </div>
      </div>
    </div>
  );
};

export default Profile;
