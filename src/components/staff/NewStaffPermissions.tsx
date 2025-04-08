import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import Button from '../common/Button';
import { permissionsData } from '../../utils/dummyData';

interface PermissionsFormData {
  createEvents: boolean;
  addClients: boolean;
  createInvoices: boolean;
}

interface NewStaffPermissionsProps {
  onNext: (data: PermissionsFormData) => void;
  onBack: () => void;
  initialData?: PermissionsFormData;
}

const NewStaffPermissions = ({ onNext, onBack, initialData }: NewStaffPermissionsProps) => {
  const methods = useForm<PermissionsFormData>({
    mode: 'onChange',
    defaultValues: initialData || {
      createEvents: false,
      addClients: false,
      createInvoices: false,
    },
  });

  const onSubmit: SubmitHandler<PermissionsFormData> = (data) => {
    onNext(data);
  };

  const permissions = permissionsData;

  return (
    <FormProvider {...methods}>
      <div className='flex flex-col space-y-6 w-[90%] h-full'>
        <h3 className='text-[32px] font-semibold text-primary'>Permissions</h3>
        <p className='text-sm text-primary'>
          Manage what staff can see and do across FlowKey.
        </p>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className='space-y-4 h-full flex flex-col'
        >
          <div className='space-y-6 flex-grow mt-6'>
            {permissions.map((permission) => (
              <div key={permission.id} className='space-y-2'>
                <label className='flex items-center gap-3 cursor-pointer group'>
                  <div className='relative'>
                    <input
                      type='checkbox'
                      {...methods.register(
                        permission.id as keyof PermissionsFormData
                      )}
                      className='sr-only peer'
                    />
                    <div className='w-6 h-6 border-2 border-gray-300 rounded-full transition-all peer-checked:border-4 peer-checked:border-secondary group-hover:border-secondary'></div>
                  </div>
                  <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900'>
                    {permission.label}
                  </span>
                </label>
                <p className='text-sm text-gray-500 pl-8'>
                  {permission.description}
                </p>
              </div>
            ))}
          </div>

          <div className='flex w-full justify-between mt-8 self-end'>
            <Button
              variant='outline'
              type='button'
              onClick={onBack}
              radius='md'
              color='#1D9B5E'
              w={100}
              h={52}
              style={{
                color: '#1D9B5E',
                fontSize: '14px',
                fontWeight: '700',
              }}
            >
              Back
            </Button>
            <Button
              radius='md'
              w={120}
              h={52}
              type='submit'
              disabled={false}
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
      </div>
    </FormProvider>
  );
};

export default NewStaffPermissions;
