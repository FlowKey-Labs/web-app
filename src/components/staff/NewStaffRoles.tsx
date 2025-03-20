import {
  useForm,
  SubmitHandler,
  FormProvider,
  useFieldArray,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../common/Button';
import DropdownSelectInput from '../common/Dropdown';
import { roleOptions, payTypeOptions } from '../utils/dummyData';

interface RoleData {
  role: string;
  payType: string;
  hourlyRate: string;
}

interface RoleFormData {
  roles: RoleData[];
}

const roleSchema = yup.object({
  role: yup.string().required('Role is required'),
  payType: yup.string().required('Pay type is required'),
  hourlyRate: yup
    .string()
    .matches(/^\d+\.?\d{0,2}$/, 'Invalid amount format')
    .required('Hourly rate is required'),
});

const schema = yup
  .object({
    roles: yup.array().of(roleSchema).min(1).required(),
  })
  .required();

interface NewStaffRolesProps {
  onNext: (data: RoleData) => void;
  onBack: () => void;
}

const NewStaffRoles = ({ onNext, onBack }: NewStaffRolesProps) => {
  const methods = useForm<RoleFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      roles: [{ role: '', payType: '', hourlyRate: '' }],
    },
  });

  const { fields, append } = useFieldArray({
    control: methods.control,
    name: 'roles',
  });

  const onSubmit: SubmitHandler<RoleFormData> = (data) => {
    onNext(data.roles[0]);
  };

  return (
    <FormProvider {...methods}>
      <div className='flex flex-col space-y-6 w-[90%] h-full'>
        <h3 className='text-[32px] font-semibold text-primary px-4'>Role</h3>
        <p className='text-primary text-sm px-4'>
          Manage staff’s role and compensation
        </p>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className='space-y-4 h-full flex flex-col'
        >
          <div className='flex-grow overflow-y-auto max-h-[calc(100vh-300px)] px-4 space-y-8'>
            {fields.map((field, index) => (
              <div key={field.id} className='space-y-4 pb-8'>
                <DropdownSelectInput
                  label='Role'
                  options={roleOptions}
                  placeholder='Select or create new role'
                  onSelectItem={(selectedItem) =>
                    methods.setValue(
                      `roles.${index}.role`,
                      selectedItem.value as string
                    )
                  }
                  hasError={!!methods.formState.errors.roles?.[index]?.role}
                  errorMessage={
                    methods.formState.errors.roles?.[index]?.role?.message
                  }
                />

                <DropdownSelectInput
                  label='Pay Type'
                  options={payTypeOptions}
                  placeholder='Select pay type'
                  onSelectItem={(selectedItem) =>
                    methods.setValue(
                      `roles.${index}.payType`,
                      selectedItem.value as string
                    )
                  }
                  hasError={!!methods.formState.errors.roles?.[index]?.payType}
                  errorMessage={
                    methods.formState.errors.roles?.[index]?.payType?.message
                  }
                />

                <div className='relative'>
                  <input
                    type='text'
                    {...methods.register(`roles.${index}.hourlyRate`)}
                    className={`w-full px-4 pt-8 pb-2 border text-sm text-gray-500 ${
                      methods.formState.errors.roles?.[index]?.hourlyRate
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } rounded-lg focus:ring-1 ${
                      methods.formState.errors.roles?.[index]?.hourlyRate
                        ? 'focus:ring-red-500'
                        : 'focus:ring-[#1D9B5E]'
                    } focus:border-transparent outline-none`}
                    placeholder='Ksh 0.00'
                  />
                  <label
                    htmlFor={`roles.${index}.hourlyRate`}
                    className='absolute top-2 left-4 text-xs text-primary'
                  >
                    Hourly Rate (KES)
                  </label>
                  {methods.formState.errors.roles?.[index]?.hourlyRate && (
                    <p className='text-sm text-red-500 mt-1'>
                      {
                        methods.formState.errors.roles?.[index]?.hourlyRate
                          ?.message as string
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}

            <p
              className='text-secondary text-xs cursor-pointer'
              onClick={() => append({ role: '', payType: '', hourlyRate: '' })}
            >
              Add another role
            </p>
          </div>

          <div className='flex justify-between w-full mt-8 self-end'>
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
      </div>
    </FormProvider>
  );
};

export default NewStaffRoles;
