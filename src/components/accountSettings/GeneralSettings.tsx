import Button from '../common/Button';
import { Group, Text, Image, Box, Checkbox, Stack } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import dropZoneIcon from '../../assets/icons/dropZone.svg';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import Input from '../common/Input';
import DropdownSelectInput from '../common/Dropdown';

interface SettingsFormData {
  companyName: string;
  font: string;
  primaryColor: string;
  support: string;
  requireTerms: boolean;
}

const fontOptions = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'open-sans', label: 'Open Sans' },
  { value: 'poppins', label: 'Poppins' },
];

const GeneralSettings = () => {
  const methods = useForm<SettingsFormData>({
    defaultValues: {
      companyName: '',
      font: 'inter',
      primaryColor: '#1D9B5E',
      support: '',
      requireTerms: false,
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    console.log(data);
    
  };

  const handleFileUpload = (files: File[]) => {
    console.log(files);
  };

  return (
    <>
      <div className='px-4 mt-4'>
        <div className='flex-1 space-y-2'>
          <h3 className='text-xl text-primary font-semibold'>Appearance</h3>
          <p className='text-sm text-gray-400'>
            Configure your system appearance settings
          </p>
        </div>
      </div>

      <div className='px-4 mt-4'>
        <div className='border-[1px] border-[#8A8D8E99] p-6 bg-white rounded-3xl space-y-4'>
          <h3 className='text-sm font-semibold'>Logo</h3>
          <div className='space-y-2'>
            <Dropzone
              radius='8px'
              onDrop={handleFileUpload}
              onReject={(files) => console.log('Rejected files:', files)}
              maxSize={20 * 1024 ** 2}
              accept={IMAGE_MIME_TYPE}
              styles={{
                root: {
                  borderColor: '#1D9B5E',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&[data-accept]': {
                    borderColor: '#1D9B5E',
                    backgroundColor: 'rgba(29, 155, 94, 0.1)',
                  },
                  '&[data-reject]': {
                    borderColor: '#ff6b6b',
                  },
                },
              }}
            >
              <Box style={{ pointerEvents: 'none' }}>
                <Group justify='center' gap='xl' mb='md' p='6'>
                  <Group gap='sm'>
                    <Image
                      src={dropZoneIcon}
                      width={24}
                      height={24}
                      alt='Upload icon'
                    />
                    <Text c='#1D9B5E'>
                      Drag and drop a file here, or{' '}
                      <span className='bg-green-100 rounded-lg text-xs p-2 cursor-pointer'>
                        Browse
                      </span>
                    </Text>
                  </Group>
                </Group>
                <Text c='#1D9B5E' ta='center' mt='auto' py='xs'>
                  Max size: 20MB
                </Text>
              </Box>
            </Dropzone>
            <p className='text-sm font-[400] text-gray-400'>
              Upload a Logo that will be used in the header of the system and
              login page.
            </p>
          </div>

          <div className='mt-6'>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Stack gap='lg'>
                  <Controller
                    name='companyName'
                    control={methods.control}
                    rules={{ required: 'Company name is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label='The name of your Company*'
                        placeholder='RayFish Swim School'
                      />
                    )}
                  />

                  <div className='flex gap-6 items-start'>
                    <Controller
                      name='font'
                      control={methods.control}
                      render={({ field }) => (
                        <DropdownSelectInput
                          {...field}
                          label='Font'
                          placeholder='Select Font'
                          options={fontOptions}
                          onSelectItem={(selectedItem) =>
                            field.onChange(selectedItem.value)
                          }
                          className='flex-1'
                        />
                      )}
                    />

                    <div className='flex-1'>
                      <Controller
                        name='primaryColor'
                        control={methods.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            name='primaryColor'
                            type='color'
                            label='Primary Color'
                          />
                        )}
                      />
                      <p className='text-xs text-gray-400 mt-1'>
                        What color should we use for the system?
                      </p>
                    </div>
                  </div>

                  <Controller
                    name='support'
                    control={methods.control}
                    rules={{ required: 'Support number is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label='Customer Support Number*'
                        placeholder='+254728373929'
                      />
                    )}
                  />
                  <p className='text-gray-400 text-sm -mt-4'>
                    The number your clients can contact when they need support.
                  </p>
                </Stack>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>

      <div className='px-4 mt-6'>
        <div className='mb-2'>
          <h3 className='text-base font-[600] text-primary'>
            Terms & Conditions
          </h3>
          <p className='text-gray-400 text-sm'>
            Terms and conditions for your business.
          </p>
        </div>

        <div className='rounded-xl bg-white border p-6 flex items-center gap-4'>
          <Controller
            name='requireTerms'
            control={methods.control}
            render={({ field }) => (
              <Checkbox
                color='#8A8D8E99'
                {...field}
                checked={field.value}
                onChange={(e) => field.onChange(e.currentTarget.checked)}
                value={field.value.toString()}
                label={
                  <Text size='sm' c='dimmed'>
                    Require users to accept Terms and Conditions
                  </Text>
                }
              />
            )}
          />
        </div>
      </div>

      <div className='flex gap-4 px-4 mt-6'>
        <Button variant='outline' radius='md' size='sm' color='red'>
          Cancel
        </Button>
        <Button
          color='#1D9B5E'
          radius='md'
          size='sm'
          onClick={methods.handleSubmit(onSubmit)}
        >
          Save Changes
        </Button>
      </div>
    </>
  );
};

export default GeneralSettings;
