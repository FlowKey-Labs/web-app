import { Modal, Button } from '@mantine/core';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import Input from '../common/Input';
import backgroundImage from '../../assets/landingpageAssets/Images/backgroundImage.png';
import phoneIcon from '../../assets/freeDemo/icons/phone.svg';
import emailIcon from '../../assets/freeDemo/icons/email.svg';
import watermarkIcon from '../../assets/freeDemo/icons/watermark.svg';
import facebookIcon from '../../assets/freeDemo/icons/facebook.svg';
import twitterIcon from '../../assets/freeDemo/icons/twitter.svg';
import instagramIcon from '../../assets/freeDemo/icons/instagram.svg';
import youtubeIcon from '../../assets/freeDemo/icons/youtube.svg';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

export interface BookingFormData {
  name: string;
  business_name: string;
  email: string;
  phone: string;
  notes: string;
}

interface BookingFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
  loading?: boolean;
}

const DemoBookingForm = ({
  opened,
  onClose,
  onSubmit,
  loading = false,
}: BookingFormProps) => {
  const methods = useForm<BookingFormData>({
    defaultValues: {
      name: '',
      business_name: '',
      email: '',
      phone: '',
      notes: '',
    },
  });

  const { control, handleSubmit } = methods;

  const onFormSubmit = (data: BookingFormData) => {
    onSubmit(data);
    methods.reset();
    try {
      notifications.show({
        title: 'Success',
        message: 'Your Demo request has been submitted successfully!',
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
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to submit the Demo request. Please try again.',
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
    }
  };

  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={isMobile ? '95%' : '60vw'}
      centered
      withCloseButton={false}
      padding='xs'
      radius='md'
      className='[&_.mantine-Modal-inner]:p-0'
    >
      <FormProvider {...methods}>
        <div className='flex flex-col md:flex-row w-full'>
          {/* Left side */}
          <div
            className='text-white p-8 flex flex-col rounded-lg w-full md:w-[45%]'
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='flex flex-col items-center md:items-start'>
              <h2 className='text-[28px] font-[600] '>Get in touch with us</h2>
              <p className='text-[18px] font-[400] mb-6'>Let's have a chat!</p>

              <div className='space-y-10 mt-8'>
                <div className='flex flex-col items-center md:flex-row md:items-start gap-4 md:gap-0'>
                  <div className=' mr-6'>
                    <img src={phoneIcon} alt='Phone' />
                  </div>
                  <div className='self-center text-base font-[400]'>
                    <p>+254 719 254 239</p>
                  </div>
                </div>

                <div className='flex flex-col items-center md:flex-row md:items-start gap-4 md:gap-0'>
                  <div className=' mr-6'>
                    <img src={emailIcon} alt='Email' />
                  </div>
                  <div className=' self-center text-base font-[400]'>
                    <p>info@flowkeylabs.com</p>
                  </div>
                </div>

                <div className='flex flex-col items-center md:flex-row md:items-start gap-4 md:gap-0'>
                  <div className=' mr-6'>
                    <img src={watermarkIcon} alt='Watermark' />
                  </div>
                  <div className=' self-center text-base font-[400]'>
                    <p>Watermark Business Park, Karen, Nairobi</p>
                  </div>
                </div>
              </div>
              <div className='mt-20 flex items-center gap-4'>
                <img
                  src={facebookIcon}
                  alt='Facebook'
                  className='cursor-pointer'
                />
                <img
                  src={twitterIcon}
                  alt='Twitter'
                  className='cursor-pointer'
                />
                <img
                  src={instagramIcon}
                  alt='Instagram'
                  className='cursor-pointer'
                />
                <img
                  src={youtubeIcon}
                  alt='Youtube'
                  className='cursor-pointer'
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className='w-full md:w-[55%] md:p-8 p-4'>
            <div className='mb-4 hidden md:block'>
              <h2 className='text-[28px] font-[600] mb-2 text-[#0F2028]'>
                Contact Information
              </h2>
              <p className='text-lg mb-4 font-[400] text-[#0F2028]'>
                Let's call you back
              </p>
            </div>
            <form
              onSubmit={handleSubmit(onFormSubmit)}
              className='md:space-y-4'
            >
              <div className='grid md:grid-cols-2 grid-cols-1 md:gap-4'>
                <Controller
                  name='name'
                  control={control}
                  rules={{
                    required: 'Name is required',
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Full Name'
                      placeholder='Enter your name'
                      className='rounded-lg h-12'
                    />
                  )}
                />
                <Controller
                  name='business_name'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Business Name'
                      placeholder='Enter your business name'
                      className='rounded-lg h-12'
                    />
                  )}
                />
              </div>

              <div className='grid md:grid-cols-2 grid-cols-1 md:gap-4'>
                <Controller
                  name='email'
                  control={control}
                  rules={{
                    required: 'Email is required',
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type='email'
                      label='Email'
                      placeholder='Enter your email'
                      className='rounded-lg h-12'
                    />
                  )}
                />

                <Controller
                  name='phone'
                  control={control}
                  rules={{
                    required: 'Phone number is required',
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='Phone Number'
                      placeholder='Enter your phone number'
                      className='rounded-lg h-12'
                    />
                  )}
                />
              </div>

              <Controller
                name='notes'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Notes'
                    placeholder='Enter any special requirements or notes...'
                    type='textarea'
                    rows={5}
                    className='rounded-lg h-24'
                  />
                )}
              />
              <div className='pt-2 flex justify-end'>
                <Button
                  h='50px'
                  type='submit'
                  loading={loading}
                  color='#1D9B5E'
                  radius='md'
                  style={{
                    fontSize: '16px',
                  }}
                >
                  Book Free Demo
                </Button>
              </div>
            </form>
          </div>
        </div>
      </FormProvider>
    </Modal>
  );
};

export default DemoBookingForm;
