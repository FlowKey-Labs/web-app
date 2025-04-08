import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import NewStaffProfile from './NewStaffProfile';
import NewStaffRoles from './NewStaffRoles';
import NewStaffPermissions from './NewStaffPermissions';
import NewStaffReview from './NewStaffReview';
import { useCreateStaffMember } from '../../hooks/reactQuery';
import NotificationToast from '../common/NotificationToast';
import { useStaffFormStore } from '../../store/staffForm';
import cancelIcon from '../../assets/icons/cancel.svg';

import { FormData } from '../../types/staffTypes';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SectionType = 'Profile' | 'Roles' | 'Permissions' | 'Review';
type SectionTypes = { title: SectionType }[];

type Section = {
  title: SectionType;
};

const sections: SectionTypes = [
  { title: 'Profile' },
  { title: 'Roles' },
  { title: 'Permissions' },
  { title: 'Review' },
];

const StaffModal = ({ isOpen, onClose }: StaffModalProps) => {
  const [showNotification, setShowNotification] = useState(false);
  const { mutate: createStaff } = useCreateStaffMember();
  
  const {
    formData,
    activeSection,
    setFormData,
    setActiveSection,
    resetForm
  } = useStaffFormStore();

  const methods = useForm<FormData>({
    defaultValues: formData
  });

  const handleProfileSubmit = (data: Required<NonNullable<FormData['profile']>>) => {
    setFormData({ profile: data });
    setActiveSection('Roles');
  };

  const handleRoleSubmit = (data: FormData['role']) => {
    setFormData({ role: data });
    setActiveSection('Permissions');
  };

  const handlePermissionsSubmit = (data: FormData['permissions']) => {
    setFormData({ permissions: data });
    setActiveSection('Review');
  };

  const handleBack = () => {
    const sectionTitles = sections.map((sec) => sec.title);
    const currentIndex = sectionTitles.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sectionTitles[currentIndex - 1] as SectionType);
    }
  };

  const contentMap: Record<SectionType, React.ReactNode> = {
    Profile: <NewStaffProfile onNext={handleProfileSubmit} initialData={formData.profile} />,
    Roles: <NewStaffRoles onNext={handleRoleSubmit} onBack={handleBack} initialData={formData.role} />,
    Permissions: (
      <NewStaffPermissions
        onNext={handlePermissionsSubmit}
        onBack={handleBack}
        initialData={formData.permissions}
      />
    ),
    Review: (
      <NewStaffReview
        formData={formData}
        onBack={handleBack}
        onSubmit={() => {
          if (!formData.profile || !formData.role || !formData.permissions) return;
          
          createStaff({
            email: formData.profile.email,
            member_id: formData.profile.userId || undefined,
            role: formData.role.role,
            pay_type: formData.role.payType,
            rate: formData.role.payType === 'hourly' ? formData.role.hourlyRate || '0' : '0',
            permissions: {
              can_create_events: formData.permissions.createEvents,
              can_add_clients: formData.permissions.addClients,
              can_create_invoices: formData.permissions.createInvoices
            }
          });

          setShowNotification(true);
          setTimeout(() => {
            resetForm();
            onClose();
          }, 2000);
        }}
      />
    ),
  };

  const renderContent = () => contentMap[activeSection] || null;

  if (!isOpen) return null;

  return (
    <FormProvider {...methods}>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end'
        onClick={onClose}
      >
      <div
        className='w-2/3 h-screen bg-white p-6 flex flex-col overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex justify-end'>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100'
            aria-label='Close modal'
          >
            <img src={cancelIcon} alt='' className='w-6 h-6' />
          </button>
        </div>

        <div className='flex-1 flex'>
          <div className='w-[40%] p-8 border-r border-gray-200'>
            <h2 className='text-[40px] font-bold mb-8'>New Staff</h2>
            <div
              className='flex flex-col gap-12 relative'
              role='tablist'
              aria-label='Staff creation steps'
            >
              {sections.map((section: Section, index, array) => (
                <div key={section.title} className='relative'>
                  {index > 0 && (
                    <div className='absolute left-[12px] top-[-24px] h-[14px] w-px bg-gray-200' />
                  )}
                  {index < array.length - 1 && (
                    <div className='absolute left-[12px] top-[32px] h-[36px] w-px bg-gray-200' />
                  )}
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        activeSection === section.title
                          ? 'border-4 border-secondary'
                          : 'border-gray-300'
                      }`}
                    />
                    <div className='flex flex-col items-start gap-1'>
                      <span
                        className={`text-lg ${
                          activeSection === section.title
                            ? 'text-primary font-medium'
                            : 'text-gray-400'
                        }`}
                      >
                        {section.title}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className='flex justify-center w-[60%] p-8'
            role='tabpanel'
            id={`${activeSection.toLowerCase()}-panel`}
            aria-labelledby={`${activeSection.toLowerCase()}-tab`}
            tabIndex={0}
          >
            {renderContent()}
          </div>
        </div>
      </div>
      {showNotification && (
        <NotificationToast
          type='success'
          title='Success'
          description="Staff member created successfully!"
          onClose={() => setShowNotification(false)}
        />
      )}
      </div>
    </FormProvider>
  );
};

export default StaffModal;
