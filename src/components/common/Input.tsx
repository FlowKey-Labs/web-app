import React, { useRef, useState } from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { rem } from '@mantine/core';
import { ActionIcon } from '@mantine/core';
import { IconClock, IconCalendar } from '@tabler/icons-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  validation?: RegisterOptions;
  focusColor?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  validation,
  className,
  containerClassName,
  focusColor = 'green-500',
  ...props
}) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeValue, setTimeValue] = useState<string>('');

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setValue(name, date);
  };

  if (type === 'date' || type === 'time') {
    return (
      <div className={`w-full ${containerClassName || ''}`}>
        <div className='relative w-full z-20'>
          {type === 'date' ? (
            <DatePickerInput
              value={selectedDate}
              onChange={handleDateChange}
              valueFormat='YYYY/MM/DD'
              placeholder={placeholder}
              rightSection={<IconCalendar size={18} stroke={1.5} />}
              clearable
              styles={{
                input: {
                  height: rem(58),
                  paddingTop: rem(24),
                  paddingBottom: rem(8),
                  fontSize: rem(14),
                  borderColor: errors[name] ? '#FF0000' : '#E5E7EB',
                  borderRadius: rem(8),
                  '&:focus': {
                    borderColor: 'transparent',
                    boxShadow: `0 0 0 1px ${
                      errors[name] ? '#FF0000' : '#1D9B5E'
                    }`,
                  },
                },
              }}
            />
          ) : (
            <TimeInput
              value={timeValue}
              rightSection={<IconClock size={18} stroke={1.5} />}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setTimeValue(value);
                if (value) {
                  const [hours, minutes] = value.split(':');
                  if (hours && minutes) {
                    const date = new Date();
                    date.setHours(parseInt(hours));
                    date.setMinutes(parseInt(minutes));
                    setValue(name, date);
                  }
                }
              }}
              withSeconds={false}
              styles={{
                input: {
                  height: rem(58),
                  paddingTop: rem(24),
                  paddingBottom: rem(8),
                  fontSize: rem(14),
                  borderColor: errors[name] ? '#FF0000' : '#E5E7EB',
                  borderRadius: rem(8),
                  '&:focus': {
                    borderColor: 'transparent',
                    boxShadow: `0 0 0 1px ${
                      errors[name] ? '#FF0000' : '#1D9B5E'
                    }`,
                  },
                },
              }}
            />
          )}

          {label && (
            <label
              htmlFor={name}
              className='absolute top-2 text-xs left-4 transition-all duration-200 text-primary'
            >
              {label}
            </label>
          )}
        </div>
        {errors[name] && (
          <p className='text-xs text-red-500 mt-1'>
            {errors[name]?.message as string}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className='mt-4 relative w-full'>
      <input
        {...props}
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, validation)}
        className={`w-full py-3 px-4 pt-8 border text-xs ${className || ''} ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        } rounded-lg focus:outline-none focus:ring-1 ${
          errors[name] ? 'focus:ring-red-500' : `focus:ring-${focusColor}`
        }`}
        style={{
          fontSize: '12px',
          fontWeight: '100',
        }}
      />
      {label && (
        <label
          htmlFor={name}
          className='absolute top-2 left-2 text-xs text-primary px-2 transition-all duration-300 pointer-events-none'
        >
          {label}
        </label>
      )}
      {errors[name] && (
        <p className='text-xs text-red-500'>
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

export default Input;
