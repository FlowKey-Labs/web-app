import { Drawer, Loader } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import { useCreateStaffMember, useGetStaffMember, useUpdateStaffMember } from '../../hooks/reactQuery';
import { useStaffFormStore } from '../../store/staffForm';
import { useUIStore } from '../../store/ui';
import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';

import NewStaffProfile from '../staff/NewStaffProfile';
import NewStaffRoles from '../staff/NewStaffRoles';
import NewStaffReview from '../staff/NewStaffReview';
import { FormData } from '../../types/staffTypes';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

type SectionType = 'Profile' | 'Roles' | 'Review';
type SectionTypes = { title: SectionType }[];

type Section = {
  title: SectionType;
};

const sections: SectionTypes = [
  { title: 'Profile' },
  { title: 'Roles' },
  { title: 'Review' },
];

interface StaffDrawerProps {
  entityId?: number | string | null;
  isEditing?: boolean;
  zIndex?: number;
}

export default function StaffDrawer({ entityId, isEditing, zIndex }: StaffDrawerProps) {
  const { closeDrawer } = useUIStore();
  const { mutate: createStaff, isPending: isCreatingStaff } = useCreateStaffMember();
  const { mutate: updateStaff, isPending: isUpdatingStaff } = useUpdateStaffMember();
  
  const { data: staffDetails, isLoading: isLoadingStaff } = useGetStaffMember(
    isEditing && entityId ? String(entityId) : ''
  );

  const { formData, activeSection, setFormData, setActiveSection, resetForm } =
    useStaffFormStore();

  const methods = useForm<FormData>({
    defaultValues: formData,
  });

  useEffect(() => {
    if (isEditing && staffDetails && entityId) {
      setFormData({
        profile: {
          email: staffDetails.user?.email || '',
          userId: staffDetails.member_id || '',
        },
        role: {
          role: staffDetails.user?.role.id || '',
          payType: staffDetails.pay_type || 'hourly',
          hourlyRate: String(staffDetails.rate || '0'),
        },
      });
    }
  }, [isEditing, staffDetails, entityId, setFormData]);

  const handleProfileSubmit = (
    data: Required<NonNullable<FormData['profile']>>
  ) => {
    setFormData({ profile: data });
    setActiveSection('Roles');
  };

  const handleRoleSubmit = (data: FormData['role']) => {
    setFormData({ role: data });
    setActiveSection('Review');
  };

  const handleBack = () => {
    const sectionTitles = sections.map((sec) => sec.title);
    const currentIndex = sectionTitles.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sectionTitles[currentIndex - 1] as SectionType);
    }
  };

  const handleSubmit = () => {
    if (!formData.profile || !formData.role || !formData.permissions)
      return;

    if (isEditing && entityId) {
      updateStaff(
        {
          id: String(entityId),
          updateStaffData: {
            role: formData.role.role,
            pay_type: formData.role.payType,
            rate:
              formData.role.payType === 'hourly'
                ? formData.role.hourlyRate || '0'
                : '0',
          },
        },
        {
          onSuccess: () => {
            notifications.show({
              title: "Success",
              message: "Staff member updated successfully!",
              color: "green",
              radius: "md",
              icon: (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-200">
                  <img src={successIcon} alt="Success" className="w-4 h-4" />
                </span>
              ),
              withBorder: true,
              autoClose: 3000,
              position: "top-right",
            });
            resetForm();
            closeDrawer();
          },
          onError: () => {
            notifications.show({
              title: "Error",
              message: "Failed to update staff member. Please try again.",
              color: "red",
              radius: "md",
              icon: (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200">
                  <img src={errorIcon} alt="Error" className="w-4 h-4" />
                </span>
              ),
              withBorder: true,
              autoClose: 3000,
              position: "top-right",
            });
          },
        }
      );
    } else {
      createStaff({
        email: formData.profile.email,
        member_id: formData.profile.userId || undefined,
        role: formData.role.role,
        pay_type: formData.role.payType,
        rate:
          formData.role.payType === 'hourly'
            ? formData.role.hourlyRate || '0'
            : '0',
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Staff member created successfully!",
            color: "green",
            radius: "md",
            icon: (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-200">
                <img src={successIcon} alt="Success" className="w-4 h-4" />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: "top-right",
          });
          resetForm();
          closeDrawer();
        },
        onError: () => {
          notifications.show({
            title: "Error",
            message: "Failed to create staff member. Please try again.",
            color: "red",
            radius: "md",
            icon: (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200">
                <img src={errorIcon} alt="Error" className="w-4 h-4" />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: "top-right",
          });
        },
      });
    }
  };

  const contentMap: Record<SectionType, React.ReactNode> = {
    Profile: (
      <NewStaffProfile
        onNext={handleProfileSubmit}
        initialData={formData.profile}
      />
    ),
    Roles: (
      <NewStaffRoles
        onNext={handleRoleSubmit}
        onBack={handleBack}
        initialData={formData.role}
      />
    ),
    Review: (
      <NewStaffReview
        formData={formData}
        onBack={handleBack}
        onSubmit={handleSubmit}
        isSubmitting={isCreatingStaff || isUpdatingStaff}
      />
    ),
  };

  const renderContent = () => contentMap[activeSection] || null;

  if (isEditing && isLoadingStaff) {
    return (
      <Drawer
        opened={true}
        onClose={closeDrawer}
        title="Loading Staff Data..."
        size='xl'
        position='right'
        zIndex={zIndex}
      >
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader color="#1D9B5E" size="xl" />
            <p className="mt-4">Loading staff data...</p>
          </div>
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      opened={true}
      onClose={() => {
        resetForm();
        closeDrawer();
      }}
      title={isEditing ? 'Edit Staff' : 'Add New Staff'}
      size='xl'
      position='right'
      styles={{
        header: {
          padding: '1rem 1.5rem',
        },
        title: {
          fontSize: '24px',
          fontWeight: 'bold',
        },
        body: {
          padding: 0,
        },
      }}
      zIndex={zIndex}
    >
      <FormProvider {...methods}>
        <div className='bg-white p-6 flex flex-col min-h-[80vh]'>
          <div className='flex-1 flex'>
            <div className='w-[40%] p-8 border-r border-gray-200'>
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
              className='flex justify-center w-[60%] p-4 min-h-[80vh]'
              role='tabpanel'
              id={`${activeSection.toLowerCase()}-panel`}
              aria-labelledby={`${activeSection.toLowerCase()}-tab`}
              tabIndex={0}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </FormProvider>
    </Drawer>
  );
} 