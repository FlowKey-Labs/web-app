import React, { useState } from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { EyeClosedIcon, EyeOpenIcon } from '../../assets/icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  validation?: RegisterOptions;
  focusColor?: string;
}

const Input: React.FC<InputProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  validation,
  className,
  focusColor = 'green-500',
  ...props
}) => {
  const {
    register,
    formState: { errors },
    trigger,
  } = useFormContext();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className='mt-4 relative'>
      <input
        {...props}
        id={name}
        type={
          showPassword &&
          (name.includes('password') || name.includes('confirmPassword'))
            ? 'text'
            : type
        }
        placeholder={placeholder}
        {...register(name, validation)}
        className={`w-full p-2 pt-6 border text-xs ${className || ''} ${
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
          className='absolute top-2 left-2 text-xs text-gray-500'
        >
          {label}
        </label>
      )}
      {(name === 'password' || name === 'confirmPassword') && (
        <button
          type='button'
          onClick={togglePasswordVisibility}
          className='absolute right-2 top-7 transform -translate-y-1/2 focus:outline-none'
        >
          {showPassword ? (
            <EyeClosedIcon className='w-5 h-5 text-gray-500' />
          ) : (
            <EyeOpenIcon className='w-5 h-5 text-gray-500' />
          )}
        </button>
      )}
      {errors[name] && (
        <p className='text-xs text-red-500'>
          {errors[name]?.message as string}
        </p>
      )}
      {(type === 'date' || type === 'time') && (
        <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
          {/* {type === 'date' && (
            <svg
              className='w-5 h-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          )} */}
          {/* {type === 'time' && (
            <svg
              className='w-5 h-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          )} */}
        </div>
      )}
    </div>
  );
};

export default Input;
