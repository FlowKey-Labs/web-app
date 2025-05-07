import { JSX, useState } from 'react';

import Header from '../headers/Header';
import Services from './Services';
import Schedule from './Schedule';
import BusinessInformation from './BusinessInformation';
import { BusinessLocation } from './BusinessLocation';
import Categories from './Categories';

type TabType =
  | 'business'
  | 'services'
  | 'locations'
  | 'schedule'
  | 'categories';

  const tabConfig = [
    { id: 'business', label: 'Business Information' },
    { id: 'categories', label: 'Categories' },
    { id: 'services', label: 'Services' },
    { id: 'locations', label: 'Locations' },
    { id: 'schedule', label: 'Schedule' },
  ];

const Profile = () => {
  const [openedAccordion, setOpenedAccordion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('business');

  const contentMap: Record<TabType, JSX.Element> = {
    business: (
      <BusinessInformation
        openedAccordion={openedAccordion}
        setOpenedAccordion={setOpenedAccordion}
      />
    ),
    services: <Services />,
    locations: <BusinessLocation />,
    schedule: <Schedule />,
    categories: <Categories />,
  };

  return (
    <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
      <div className='mt-2'>
        <Header showSearch={false} />
      </div>
      <div className='flex-1 p-6'>
        <div className='flex justify-between items-center px-4'>
          <h2 className='text-primary text-[24px] font-[600]'>Profile</h2>
        </div>

        <div className='mt-6 flex gap-6 px-4'>
          {tabConfig.map((tab) => (
            <p
              key={tab.id}
              className={`text-base font-[600] cursor-pointer hover:text-secondary ${
                activeTab === tab.id ? 'text-secondary' : 'text-primary'
              }`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              {tab.label}
            </p>
          ))}
        </div>

        <div className='mt-6 flex min-h-[350px] px-6'>
          {contentMap[activeTab]}
        </div>
      </div>
    </div>
  );
};

export default Profile;
