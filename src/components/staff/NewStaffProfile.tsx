import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../common/Input';
import Button from '../common/Button';

interface ProfileFormData {
  preferedName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  userId: string;
}

const schema = yup
  .object({
    preferedName: yup.string().required('Name is required'),
    lastName: yup.string().required('Last name is required'),
    phoneNumber: yup.string().required('Phone number is required'),
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required'),
    userId: yup.string().required('User ID is required'),
  })
  .required();

interface NewStaffProfileProps {
  onNext: (data: ProfileFormData) => void;
}

const NewStaffProfile = ({ onNext }: NewStaffProfileProps) => {
  const methods = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<ProfileFormData> = (data) => {
    console.log('Profile Data:', data);
    onNext(data);
  };

  return (
    <div className='flex flex-col space-y-6 w-[90%] h-full'>
      <h3 className='text-[32px] font-semibold text-primary'>
        Personal Information
      </h3>
      <p className='text-primary text-sm'>
        Enter your team member’s phone number or email to send them an
        invitation to access FlowKey
      </p>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className='space-y-4 h-full flex flex-col'
        >
          <div className='flex flex-col gap-6 flex-grow'>
            <div className='space-y-4'>
              <Input
                name='preferedName'
                label='Preferred Name'
                placeholder='Enter preferred name'
                type='text'
                validation={{ required: 'Name is required' }}
              />
              <Input
                name='phoneNumber'
                label='Phone Number'
                placeholder='Enter phone number'
                type='tel'
                validation={{ required: 'Phone number is required' }}
              />
              <Input
                name='userId'
                label='User ID'
                placeholder='Enter user ID'
                type='text'
                validation={{ required: 'User ID is required' }}
              />
              <Input
                name='lastName'
                label='Last Name'
                placeholder='Enter last name'
                type='text'
                validation={{ required: 'Last name is required' }}
              />
              <Input
                name='email'
                label='Email'
                type='email'
                placeholder='Enter email address'
                validation={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email format',
                  },
                }}
              />
            </div>
          </div>
          <div className='flex justify-end mt-8'>
            <Button
              radius='md'
              w={100}
              type='submit'
              disabled={!methods.formState.isDirty}
              style={{
                backgroundColor: '#D2F801',
                color: '#0F2028',
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              Next
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default NewStaffProfile;
