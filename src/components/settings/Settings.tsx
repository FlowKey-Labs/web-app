import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import Button from '../common/Button';
import GeneralSettings from './GeneralSettings';
import Notifications from './Notifications';
import { NotificationsFormData } from './Notifications';

type TabType = 'general' | 'notifications';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [openedAccordion, setOpenedAccordion] = useState<string | null>(null);

  const notificationsMethods = useForm<NotificationsFormData>({
    defaultValues: {
      sessionReminderSms: '' 
    }
  });
  const tabConfig = [
    { id: 'general', label: 'General Settings' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
      <div className='mt-2 flex justify-between px-8 py-6'>
        <h2 className='font-[700] text-[32px]'>Settings</h2>
        <Button
          color='#1D9B5E'
          radius='md'
          size='md'
          onClick={() => {
          }}
        >
          Save Changes
        </Button>
      </div>

      <div className='flex-1 p-6'>
        <div className='flex gap-6 px-4 pb-4'>
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              className={`text-base font-semibold cursor-pointer pb-2 ${
                activeTab === tab.id
                  ? 'text-secondary'
                  : 'text-primary hover:text-secondary'
              }`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className='mt-6'>
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'notifications' && (
            <FormProvider {...notificationsMethods}>
              <Notifications
                openedAccordion={openedAccordion}
                setOpenedAccordion={setOpenedAccordion}
                methods={notificationsMethods}
                control={notificationsMethods.control}
                handleSubmit={notificationsMethods.handleSubmit}
              />
            </FormProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
