import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';
import { FormData } from '../../types/staffTypes';

type ProfileData = Required<NonNullable<FormData['profile']>>;

interface NewStaffProfileProps {
  onNext: (data: ProfileData) => void;
  initialData?: ProfileData;
}

const NewStaffProfile = ({ onNext, initialData }: NewStaffProfileProps) => {
  const methods = useForm<ProfileData>({
    mode: 'onChange',
    defaultValues: initialData,
  });

  const onSubmit: SubmitHandler<ProfileData> = (data) => {
    onNext(data);
  };

  return (
    <div className='flex flex-col space-y-6'>
      <h3 className='text-[32px] font-semibold text-primary'>
        Personal Information
      </h3>
      <p className='text-primary text-sm'>
        Enter your team member's email to send them an invitation to access
        FlowKey
      </p>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className='space-y-4 h-full flex flex-col'
        >
          <div className='flex flex-col gap-6 flex-grow'>
            <div className='space-y-4'>
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

              <Controller
                name='userId'
                control={methods.control}
                rules={{
                  required: 'National ID/ Passport No is required',
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='National ID/ Passport No'
                    placeholder='Enter National ID/ Passport No'
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
              disabled={!methods.formState.isValid}
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
