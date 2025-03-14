import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../common/Button';

interface RoleFormData {
  role: string;
  payType: string;
  hourlyRate: string;
}

const schema = yup
  .object({
    role: yup.string().required('Role is required'),
    payType: yup.string().required('Pay type is required'),
    hourlyRate: yup
      .string()
      .matches(/^\d+\.?\d{0,2}$/, 'Invalid amount format')
      .required('Hourly rate is required'),
  })
  .required();

interface NewStaffRolesProps {
  onNext: (data: RoleFormData) => void;
  onBack: () => void;
}

const NewStaffRoles = ({ onNext, onBack }: NewStaffRolesProps) => {
  const methods = useForm<RoleFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<RoleFormData> = (data) => {
    console.log('Role Data:', data);
    onNext(data);
  };

  return (
    <FormProvider {...methods}>
      <div className='flex flex-col space-y-6 w-[90%] h-full'>
        <h3 className='text-[32px] font-semibold text-primary'>Role</h3>
        <p className='text-primary text-sm'>
          Manage staff’s role and compensation
        </p>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className='space-y-4 h-full flex flex-col'
        >
          <div className='space-y-4 flex-grow'>
            <div className='relative'>
              <select
                {...methods.register('role')}
                className={`w-full px-3 pt-8 pb-2 border text-sm text-gray-500 ${
                  methods.formState.errors.role
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 ${
                  methods.formState.errors.role
                    ? 'focus:ring-red-500'
                    : 'focus:ring-[#D2F801]'
                } focus:border-transparent outline-none pr-10`}
              >
                <option value=''>Select or create new role</option>
                <option value='manager'>Manager</option>
                <option value='supervisor'>Supervisor</option>
                <option value='staff'>Staff</option>
                <option value='intern'>Intern</option>
              </select>
              <label
                htmlFor='role'
                className='absolute top-2 left-4 text-xs text-primary'
              >
                Role
              </label>
              {methods.formState.errors.role && (
                <p className='text-sm text-red-500 mt-1'>
                  {methods.formState.errors.role.message as string}
                </p>
              )}
            </div>

            <div className='relative'>
              <select
                {...methods.register('payType')}
                className={`w-full px-3 pt-8 pb-2 border text-sm text-gray-500 ${
                  methods.formState.errors.payType
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 ${
                  methods.formState.errors.payType
                    ? 'focus:ring-red-500'
                    : 'focus:ring-[#D2F801]'
                } focus:border-transparent outline-none pr-10`}
              >
                <option value='hourly'>Hourly</option>
                <option value='salary'>Salary</option>
                <option value='commission'>Commission</option>
              </select>
              <label
                htmlFor='payType'
                className='absolute top-2 left-4 text-xs text-primary'
              >
                Pay Type
              </label>
              {methods.formState.errors.payType && (
                <p className='text-sm text-red-500 mt-1'>
                  {methods.formState.errors.payType.message as string}
                </p>
              )}
            </div>

            <div className='relative'>
              <input
                type='text'
                {...methods.register('hourlyRate')}
                className={`w-full px-4 pt-8 pb-2 border text-sm text-gray-500 ${
                  methods.formState.errors.hourlyRate
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 ${
                  methods.formState.errors.hourlyRate
                    ? 'focus:ring-red-500'
                    : 'focus:ring-[#D2F801]'
                } focus:border-transparent outline-none`}
                placeholder='Ksh 0.00'
              />
              <label
                htmlFor='hourlyRate'
                className='absolute top-2 left-4 text-xs text-primary'
              >
                Hourly Rate (KES)
              </label>
              {methods.formState.errors.hourlyRate && (
                <p className='text-sm text-red-500 mt-1'>
                  {methods.formState.errors.hourlyRate.message as string}
                </p>
              )}
            </div>

            <p className='text-secondary text-xs cursor-pointer'>
              Add another role
            </p>
          </div>

          <div className='flex justify-between w-full mt-8 self-end'>
            <Button
              variant='outline'
              type='button'
              onClick={onBack}
              radius='md'
              color='black'
              w={100}
              style={{
                color: '#0F2028',
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              Back
            </Button>
            <Button
              radius='md'
              w={100}
              type='submit'
              disabled={!methods.formState.isValid || !methods.formState.isDirty}
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
      </div>
    </FormProvider>
  );
};

export default NewStaffRoles;
