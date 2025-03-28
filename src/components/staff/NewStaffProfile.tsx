import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';

interface ProfileFormData {
  preferedName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  userId: string;
}

interface NewStaffProfileProps {
  onNext: (data: ProfileFormData) => void;
}

const NewStaffProfile = ({ onNext }: NewStaffProfileProps) => {
  const methods = useForm<ProfileFormData>({
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<ProfileFormData> = (data) => {
    onNext(data);
  };

  return (
    <div className='flex flex-col space-y-6 w-[90%] h-full'>
      <h3 className='text-[32px] font-semibold text-primary'>
        Personal Information
      </h3>
      <p className='text-primary text-sm'>
        Enter your team member's phone number or email to send them an
        invitation to access FlowKey
      </p>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className='space-y-4 h-full flex flex-col'
        >
          <div className='flex flex-col gap-6 flex-grow'>
            <div className='space-y-4'>
              {/* Preferred Name */}
              <Controller
                name='preferedName'
                control={methods.control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Preferred Name'
                    placeholder='Enter preferred name'
                    type='text'
                    focusColor='secondary'
                  />
                )}
              />

              {/* Last Name */}
              <Controller
                name='lastName'
                control={methods.control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Last Name'
                    placeholder='Enter last name'
                    type='text'
                  />
                )}
              />

              {/* Phone Number */}
              <Controller
                name='phoneNumber'
                control={methods.control}
                rules={{
                  required: 'Phone number is required',
                  pattern: {
                    value:
                      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
                    message: 'Invalid phone number',
                  },
                  minLength: {
                    value: 10,
                    message: 'phone number must be at least 10 digits',
                  },
                  maxLength: {
                    value: 15,
                    message: 'phone number must not exceed 15 digits',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Phone Number'
                    placeholder='(000) 000 000'
                    type='tel'
                  />
                )}
              />

              {/* Email */}
              <Controller
                name='email'
                control={methods.control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message:
                      'Please enter a valid email address (e.g., name@example.com)',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Email'
                    type='email'
                    placeholder='user@email.com'
                  />
                )}
              />

              {/* User ID */}
              <Controller
                name='userId'
                control={methods.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='User ID'
                    placeholder='Team member ID (optional)'
                    type='text'
                  />
                )}
              />
            </div>
          </div>
          <div className='flex justify-end mt-8'>
            <Button
              radius='md'
              w={120}
              h={52}
              type='submit'
              disabled={!methods.formState.isDirty}
              style={{
                backgroundColor: '#1D9B5E',
                color: '#FFF',
                fontSize: '14px',
                fontWeight: '700',
              }}
            >
              Continue
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default NewStaffProfile;
