import { Accordion, Checkbox } from '@mantine/core';
import {
  FormProvider,
  UseFormReturn,
  Controller,
  Control,
  UseFormHandleSubmit,
} from 'react-hook-form';
import Button from '../common/Button';
import Input from '../common/Input';
import { useState } from 'react';

export interface NotificationsFormData {
  sessionReminderSms: string;
}

interface NotificationsSettingsProps {
  openedAccordion: string | null;
  setOpenedAccordion: (value: string | null) => void;
  methods: UseFormReturn<NotificationsFormData>;
  control: Control<NotificationsFormData>; 
  handleSubmit: UseFormHandleSubmit<NotificationsFormData>; 
}

const Notifications = ({
  methods,
  control,
  handleSubmit,
}: NotificationsSettingsProps) => {
  const [openedAppointments, setOpenedAppointments] = useState<string | null>(
    null
  );
  const [openedPayments, setOpenedPayments] = useState<string | null>(null);
  const [openedReminders, setOpenedReminders] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const onSubmit = (data: NotificationsFormData) => {};

  return (
    <div className='px-4 mt-4'>
      <div className='flex-1 space-y-2'>
        <h3 className='text-xl text-primary font-semibold'>Notifications</h3>
        <p className='text-sm text-gray-400'>
          Configure your system appearance settings
        </p>
      </div>

      <div className='mt-4 space-y-6'>
        <Accordion
          color='white'
          transitionDuration={300}
          variant='contained'
          chevronPosition='right'
          radius='md'
          value={openedAppointments}
          onChange={setOpenedAppointments}
        >
          <Accordion.Item value='appointments'>
            <Accordion.Control
              icon={
                <div className='rounded-full bg-cardsBg p-2 ml-2'>
                  <Checkbox
                    checked={true}
                    readOnly
                    radius='xl'
                    size='sm'
                    color='#32936F3D'
                  />
                </div>
              }
            >
              <div className='flex flex-col gap-1 ml-2'>
                <h3 className='text-primary text-sm font-[600]'>
                  Appointments Notification
                </h3>
                <p className='text-gray-500 text-sm'>
                  Notifications for any activities on your calendar
                </p>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='px-6 py-4'></div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Accordion
          color='white'
          transitionDuration={300}
          variant='contained'
          chevronPosition='right'
          radius='md'
          value={openedPayments}
          onChange={setOpenedPayments}
        >
          <Accordion.Item value='payments'>
            <Accordion.Control
              icon={
                <div className='rounded-full bg-cardsBg p-2 ml-2'>
                  <Checkbox
                    checked={true}
                    readOnly
                    radius='xl'
                    size='sm'
                    color='#32936F3D'
                  />
                </div>
              }
            >
              <div className='flex flex-col gap-1 ml-2'>
                <h3 className='text-primary text-sm font-[600]'>
                  Payment Confirmation Notifications
                </h3>
                <p className='text-gray-500 text-sm'>
                  Notifications for any received payments
                </p>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='px-6 py-4'></div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Accordion
          color='white'
          transitionDuration={300}
          variant='contained'
          chevronPosition='right'
          radius='md'
          value={openedReminders}
          onChange={setOpenedReminders}
        >
          <Accordion.Item value='reminders'>
            <Accordion.Control
              icon={
                <div className='rounded-full bg-cardsBg p-2 ml-2'>
                  <Checkbox
                    checked={true}
                    readOnly
                    radius='xl'
                    size='sm'
                    color='#32936F3D'
                  />
                </div>
              }
            >
              <div className='flex flex-col gap-1 ml-2'>
                <h3 className='text-primary text-sm font-[600]'>
                  Appointments Reminders
                </h3>
                <p className='text-gray-400 text-sm'>
                  Notifications to clients for upcoming sessions
                </p>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='px-6 py-4'>
                <FormProvider {...methods}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='w-full space-y-4'
                  >
                    <div className='flex items-center gap-3'>
                      <Checkbox
                        checked={isChecked}
                        onChange={(event) =>
                          setIsChecked(event.currentTarget.checked)
                        }
                        size='sm'
                        color='#32936F3D'
                      />
                      <span className='text-sm text-gray-400'>
                        Send session reminder SMS to clients
                      </span>
                    </div>

                    <div className='mt-4'>
                      <Controller
                        name='sessionReminderSms'
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label='Session reminder sms*'
                            placeholder='Dear @username, your session @session_name begins at @time'
                            className='w-full'
                          />
                        )}
                      />
                      <p className='text-xs text-gray-500 mt-1'>
                        Variables: @username, @session_name, @time
                      </p>
                    </div>
                  </form>
                </FormProvider>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
      <div className='flex py-4 gap-6'>
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
        <Button size='sm' radius='md' type='submit' color='#1D9B5E'>
          Save & Continue
        </Button>
      </div>
    </div>
  );
};

export default Notifications;
