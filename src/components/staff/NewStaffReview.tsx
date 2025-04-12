import { Checkbox, Accordion } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Button from '../common/Button';
import { FormData } from '../../types/staffTypes';
import DropdownSelectInput, { DropDownItem } from '../common/Dropdown';
import { SingleValue } from 'react-select';
import { Notifications } from '@mantine/notifications';

interface DisplayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
}

const DisplayInput: React.FC<DisplayInputProps> = ({
  label,
  value,
  ...props
}) => (
  <div className='mt-4 relative'>
    <input
      {...props}
      value={value}
      disabled
      className='w-full p-2 pt-8 border text-sm border-gray-300 rounded-lg focus:outline-none'
      style={{ fontSize: '12px', fontWeight: '100' }}
    />
    <label className='absolute top-2 left-2 text-sm text-gray-500'>
      {label}
    </label>
  </div>
);

interface NewStaffReviewProps {
  formData: FormData;
  onBack: () => void;
  onSubmit: () => void;
}

const NewStaffReview = ({
  formData,
  onBack,
  onSubmit,
}: NewStaffReviewProps) => {
  const sections = [
    {
      title: 'Profile',
      description: 'Personal Information',
      completed: formData.profile !== undefined,
      content: formData.profile && (
        <div className='space-y-4 px-2 py-2'>
          <DisplayInput label='Email' value={formData.profile.email} />
          <DisplayInput label='User ID' value={formData.profile.userId} />
        </div>
      ),
    },
    {
      title: 'Role',
      description: 'Staff Role and Payment',
      completed: formData.role !== undefined,
      content: formData.role && (
        <div className='space-y-4 px-2 py-2'>
          <DropdownSelectInput
            label='Role'
            options={[{ value: formData.role.role, label: formData.role.role }]}
            defaultValue={
              {
                value: formData.role.role,
                label: formData.role.role,
              } as SingleValue<DropDownItem> & string
            }
            isDisabled
            onSelectItem={() => {}}
            isSearchable={false}
            isClearable={false}
          />
          <DropdownSelectInput
            label='Pay Type'
            options={[
              { value: formData.role.payType, label: formData.role.payType },
            ]}
            defaultValue={
              {
                value: formData.role.payType,
                label: formData.role.payType,
              } as SingleValue<DropDownItem> & string
            }
            isDisabled
            onSelectItem={() => {}}
            isSearchable={false}
            isClearable={false}
          />
          {formData.role.payType === 'hourly' && formData.role.hourlyRate && (
            <DisplayInput label='Hourly Rate' value={formData.role.hourlyRate} />
          )}
        </div>
      ),
    },
    {
      title: 'Permissions',
      description: 'Access and Permissions',
      completed: formData.permissions !== undefined,
      content: formData.permissions && (
        <div className='space-y-4 px-2 py-2'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={formData.permissions.createEvents}
                readOnly
                radius='xl'
                size='sm'
                color='#32936F3D'
              />
              <span className='text-sm text-gray-700'>Create Events</span>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={formData.permissions.addClients}
                readOnly
                radius='xl'
                size='sm'
                color='#32936F3D'
              />
              <span className='text-sm text-gray-700'>Add Clients</span>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={formData.permissions.createInvoices}
                readOnly
                radius='xl'
                size='sm'
                color='#32936F3D'
              />
              <span className='text-sm text-gray-700'>Create Invoices</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleSubmit = () => {
    onSubmit();
    notifications.show({
      title: 'Success',
      message: 'Staff member added successfully',
      color: 'green',
      position: 'top-right',
    });
  };

  return (
    <div className='flex flex-col space-y-6'>
      <h3 className='text-[32px] font-semibold text-primary'>Review</h3>
      <div className='flex bg-[#F0F9F6] py-4 px-6 rounded-md gap-4'>
        <Checkbox
          defaultChecked
          radius='xl'
          size='sm'
          color='#32936F3D'
          style={{
            marginTop: '1px',
          }}
        />
        <p className='text-[#32936F] text-xs'>
          Everything looks good. We'll invite this team member to finish setting
          up their account.
        </p>
      </div>

      <Accordion
        className='flex-grow'
        transitionDuration={200}
        chevronPosition='right'
      >
        {sections.map((section, index) => (
          <Accordion.Item
            key={index}
            value={section.title}
            className='border border-gray-200 rounded-lg mb-2 overflow-hidden group'
          >
            <Accordion.Control>
              <div className='flex justify-center gap-4'>
                <div className='relative w-4 h-4 top-1'>
                  <Checkbox
                    checked={section.completed}
                    radius='xl'
                    size='sm'
                    color='#32936F3D'
                    readOnly
                  />
                </div>
                <div className='flex-grow'>
                  <h4 className='text-lg font-medium text-primary group-hover:text-gray-500 transition-colors'>
                    {section.title}
                  </h4>
                  <p className='text-sm text-gray-400'>{section.description}</p>
                </div>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className='py-4'>{section.content}</div>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      <div className='flex justify-between w-full mt-8 self-end gap-6'>
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
          type='button'
          onClick={handleSubmit}
          style={{
            backgroundColor: '#1D9B5E',
            color: '#FFF',
            fontSize: '14px',
            fontWeight: '700',
          }}
        >
          Finish
        </Button>
      </div>
    </div>
  );
};

export default NewStaffReview;
