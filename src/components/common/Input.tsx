import React, { useState, useEffect } from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { ColorInput } from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { rem } from '@mantine/core';
import { IconClock, IconCalendar } from '@tabler/icons-react';

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  name: string;
  label?: string;
  validation?: RegisterOptions;
  focusColor?: string;
  containerClassName?: string;
  rows?: number;
}

const Input: React.FC<InputProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  validation,
  className,
  containerClassName,
  focusColor = 'secondary',
  ...props
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const currentValue = watch(name);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeValue, setTimeValue] = useState<string>('');

  useEffect(() => {
    if (type === 'date' && currentValue) {
      try {
        const date = new Date(currentValue);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    } else if (type === 'time' && currentValue) {
      setTimeValue(currentValue);
    }
  }, [currentValue, type, name]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setValue(name, date);
  };

  const getFocusColor = () => {
    if (errors[name]) return '#FF0000';
    return focusColor === 'green-500' ? '#1D9B5E' : focusColor;
  };

  if (type === 'color') {
    return (
      <div className={`w-full ${containerClassName || ''}`}>
        <div className='relative w-full'>
          <ColorInput
            value={watch(name)}
            onChange={(color) => setValue(name, color)}
            placeholder={placeholder}
            withPicker={false}
            disallowInput
            swatches={[
              '#1D9B5E',
              '#25262b',
              '#868e96',
              '#fa5252',
              '#e64980',
              '#be4bdb',
              '#7950f2',
              '#4c6ef5',
              '#228be6',
              '#15aabf',
              '#12b886',
              '#40c057',
              '#82c91e',
              '#fab005',
              '#fd7e14',
            ]}
            swatchesPerRow={7}
            styles={{
              input: {
                height: rem(58),
                paddingTop: rem(24),
                paddingBottom: rem(8),
                fontSize: rem(14),
                borderColor: errors[name] ? '#FF0000' : '#E5E7EB',
                borderRadius: rem(8),
                '&:focus': {
                  borderColor: getFocusColor(),
                  boxShadow: `0 0 0 1px ${getFocusColor()}`,
                },
              },
              label: {
                position: 'absolute',
                top: rem(8),
                left: rem(16),
                fontSize: rem(12),
                zIndex: 1,
                pointerEvents: 'none',
                color: '#6B7280',
              },
            }}
          />
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

  if (type === 'date' || type === 'time') {
    return (
      <div className={`w-full ${containerClassName || ''}`}>
        <div className='relative w-full z-20'>
          {type === 'date' ? (
            <DatePickerInput
              value={selectedDate}
              onChange={handleDateChange}
              valueFormat='YYYY-MM-DD'
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
                    borderColor: '#1D9B5E',
                    boxShadow: `0 0 0 1px ${getFocusColor()}`,
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
                setValue(name, value); 
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
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:focus': {
                    borderColor: getFocusColor(),
                    boxShadow: `0 0 0 1px ${getFocusColor()}`,
                    outline: 'none',
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
    <div className={`w-full mt-4 ${containerClassName || ''}`}>
      <div className='relative w-full'>
        {type === 'textarea' ? (
          <textarea
            {...register(name, validation)}
            id={name}
            placeholder={placeholder}
            rows={props.rows || 4}
            className={`w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none  focus:ring-[1px] focus:border-none ${
              errors[name]
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : `focus:ring-${focusColor} focus:border-${focusColor}`
            }`}
            {...props}
          />
        ) : (
          <input
            {...register(name, validation)}
            type={type}
            id={name}
            placeholder={placeholder}
            className={`w-full h-[58px] border border-gray-300 rounded-lg px-4 pt-6 pb-2 text-xs focus:outline-none focus:ring-[1px] focus:border-none ${
              errors[name]
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : `focus:ring-${focusColor} focus:border-${focusColor}`
            }`}
            {...props}
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
};

export default Input;