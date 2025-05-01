import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import GeneralSettings from './GeneralSettings';
import Notifications from './Notifications';
import { NotificationsFormData } from './Notifications';
import Policies from './Policies';

type TabType = 'general' | 'notifications' | 'policies';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [openedAccordion, setOpenedAccordion] = useState<string | null>(null);

  const notificationsMethods = useForm<NotificationsFormData>({
    defaultValues: {
      sessionReminderSms: '',
    },
  });
  const tabConfig = [
    { id: 'general', label: 'General Settings' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'policies', label: 'Policies' },
  ];

  return (
    <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
      <div className='mt-2 flex justify-between px-8 py-6'>
        <h2 className='font-[700] text-[32px]'>Settings</h2>
      </div>

      <div className='flex-1 p-6'>
        <div className='flex gap-6 px-4'>
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

        <div className=''>
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
          {activeTab === 'policies' && <Policies />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
