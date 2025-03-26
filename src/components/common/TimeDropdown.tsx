import { useState } from 'react';
import DropDownMenu from './DropdownMenu';
import dropdownIcon from '../../assets/icons/dropIcon.svg';

const formatTimeToAMPM = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hourNum = parseInt(hours, 10);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = hourNum % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      options.push({
        value: time,
        label: formatTimeToAMPM(time),
      });
    }
  }
  return options;
};

export const TimeDropdown = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropDownMenu
      show={isOpen}
      setShow={setIsOpen}
      dropDownPosition='center'
      actionElement={
        <div className='p-2 border-b w-32 border-gray-200 rounded-md outline-none cursor-pointer flex items-center justify-between'>
          <p className='text-primary text-sm'>{formatTimeToAMPM(value)}</p>
          <img src={dropdownIcon} alt='dropdown icon' className='w-3 h-3' />
        </div>
      }
    >
      <div className='w-28 border border-secondary text-sm rounded-lg py-2 px-2 cursor-pointer max-h-40 overflow-y-auto scrollbar-hide'>
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className={`block py-1 px-2 rounded ${
              value === option.value ? 'bg-[#EAFCF3]' : 'hover:bg-[#DAF8E6]'
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </DropDownMenu>
  );
};
