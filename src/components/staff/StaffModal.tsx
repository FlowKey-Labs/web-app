import { useState } from 'react';
import NewStaffProfile from './NewStaffProfile';
import NewStaffRoles from './NewStaffRoles';
import NewStaffPermissions from './NewStaffPermissions';
import NewStaffReview from './NewStaffReview';
import { FormData } from './types';
import cancelIcon from '../../assets/icons/cancel.svg';

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
  const [activeSection, setActiveSection] = useState<SectionType>('Profile');
  const [formData, setFormData] = useState<FormData>({});

  const handleProfileSubmit = (data: FormData['profile']) => {
    setFormData((prev) => ({ ...prev, profile: data }));
    setActiveSection('Roles');
  };

  const handleRoleSubmit = (data: FormData['role']) => {
    setFormData((prev) => ({ ...prev, role: data }));
    setActiveSection('Permissions');
  };

  const handlePermissionsSubmit = (data: FormData['permissions']) => {
    setFormData((prev) => ({ ...prev, permissions: data }));
    setActiveSection('Review');
  };

  const handleBack = () => {
    const sectionTitles = sections.map((sec) => sec.title);
    const currentIndex = sectionTitles.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sectionTitles[currentIndex - 1]);
    }
  };

  const contentMap: Record<SectionType, React.ReactNode> = {
    Profile: <NewStaffProfile onNext={handleProfileSubmit} />,
    Roles: <NewStaffRoles onNext={handleRoleSubmit} onBack={handleBack} />,
    Permissions: (
      <NewStaffPermissions
        onNext={handlePermissionsSubmit}
        onBack={handleBack}
      />
    ),
    Review: (
      <NewStaffReview
        formData={formData}
        onBack={handleBack}
        onSubmit={() => {
          onClose();
        }}
      />
    ),
  };

  const renderContent = () => contentMap[activeSection] || null;

  if (!isOpen) return null;

  return (
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
    </div>
  );
};

export default StaffModal;
