import { JSX, useState } from 'react';
import Header from '../headers/Header';
import Schedule from './Schedule';
import BusinessInformation from './BusinessInformation';
import { BusinessLocation } from './BusinessLocation';
import Categories from './Categories';
import BookingSettings from './BookingSettings';
import Availability from './Availability';
import BookingLink from './BookingLink';


type TabType = 'business' | 'locations' | 'schedule' | 'categories' | 'bookings' | 'availability' | 'booking-link';

const tabConfig = [
  { id: 'business', label: 'Business Information' },
  { id: 'categories', label: 'Session Categories' },
  { id: 'locations', label: 'Locations' },
  { id: 'availability', label: 'Availability' },
  { id: 'bookings', label: 'Booking Settings' },
  { id: 'booking-link', label: 'Booking Link' },
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

    locations: <BusinessLocation />,
    schedule: <Schedule />,
    categories: <Categories />,
    bookings: (
      <BookingSettings
        openedAccordion={openedAccordion}
        setOpenedAccordion={setOpenedAccordion}
      />
    ),
    availability: <Availability />,
    'booking-link': <BookingLink />,
  };

  return (
    <div className='flex flex-col h-screen bg-gray-50 w-full overflow-y-auto'>
      <div className='mt-2'>
        <Header showSearch={false} />
      </div>
      <div className='flex-1 p-2 sm:p-3 lg:p-4'>
        {/* Header Section */}
        <div className='mb-4 lg:mb-6'>
          <div className='px-2 sm:px-3 lg:px-4'>
            <h1 className='text-primary text-xl sm:text-2xl lg:text-3xl font-bold mb-1'>Profile</h1>
            <p className='text-gray-600 text-sm lg:text-base'>Manage your business profile and settings</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='mb-4 lg:mb-6'>
          <div className='px-2 sm:px-3 lg:px-4'>
            <nav className='flex gap-1 overflow-x-auto bg-white rounded-lg p-1 shadow-sm border border-gray-200 scrollbar-hide'>
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  className={`relative px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base font-medium rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0 min-w-max ${
                    activeTab === tab.id 
                      ? 'bg-secondary text-white shadow-sm transform scale-[0.98] lg:scale-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab(tab.id as TabType)}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-secondary/10 rounded-md -z-10" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className='flex-1 min-h-0'>
          <div className='px-2 sm:px-3 lg:px-4 h-full'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden'>
              <div className='p-3 sm:p-4 lg:p-6 h-full overflow-y-auto'>
                {contentMap[activeTab]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
