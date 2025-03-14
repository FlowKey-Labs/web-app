import { Checkbox } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Button from '../common/Button';
import { FormData } from './types';
import rightIcon from '../../assets/icons/tableRight.svg';
import { sectionsData } from '../../components/utils/dummyData';

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
  const handleSubmit = () => {
    onSubmit();
    notifications.show({
      title: 'Success',
      message: 'Staff member added successfully',
      color: 'green',
      position: 'top-right',
    });
  };
  const sections = sectionsData;

  return (
    <div className='flex flex-col space-y-6 w-[90%] h-full'>
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
        <p className='text-[#32936F] text-xs '>
          Everything looks good. We’ll invite this team member to finish setting
          up their account.
        </p>
      </div>

      <form className='space-y-2 flex-grow' role='tablist'>
        {sections.map((section, index) => (
          <div key={index}>
            <div
              className='p-4 rounded-lg hover:bg-gray-50 transition-all cursor-pointer group'
              onClick={() => {
                const sectionMap: Record<string, number> = {
                  Profile: 0,
                  Roles: 1,
                  Permissions: 2,
                };
                const currentSection = sectionMap[section.title];
                if (currentSection !== undefined) {
                  for (
                    let i = Object.keys(sectionMap).length - 1;
                    i > currentSection;
                    i--
                  ) {
                    onBack();
                  }
                }
              }}
              role='tab'
              aria-selected='false'
              aria-controls={`section-${section.title.toLowerCase()}`}
              tabIndex={0}
            >
              <div className='flex justify-center gap-4'>
                <div className='relative w-4 h-4 top-1'>
                  <Checkbox
                    defaultChecked
                    radius='xl'
                    size='sm'
                    color='#32936F3D'
                  />
                </div>
                <div className='flex-grow'>
                  <h4 className='text-lg font-medium text-primary group-hover:text-gray-500 transition-colors'>
                    {section.title}
                  </h4>
                  <p className='text-sm text-gray-400'>{section.description}</p>
                </div>
                <div className='flex items-center'>
                  <img src={rightIcon} alt='right icon' className='w-4 h-4' />
                </div>
              </div>
            </div>
            {index < sections.length - 1 && (
              <div className='h-[1px] bg-gray-200 my-1' />
            )}
          </div>
        ))}
      </form>

      <div className='flex justify-between w-full mt-8 self-end gap-6'>
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
          type='button'
          onClick={handleSubmit}
          style={{
            backgroundColor: '#D2F801',
            color: '#0F2028',
            fontSize: '12px',
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
