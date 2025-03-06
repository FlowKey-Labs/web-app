import React, { useState } from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { EyeClosedIcon, EyeOpenIcon } from '../../assets/icons';

interface InputProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  validation?: RegisterOptions;
}

const Input: React.FC<InputProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  validation,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className='mt-4 relative'>
      <input
        id={name}
        type={
          showPassword &&
          (name.includes('password') || name.includes('confirmPassword'))
            ? 'text'
            : type
        }
        placeholder={placeholder}
        {...register(name, validation)}
        className={`w-full p-2 pt-6 border text-xs ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        } rounded-lg focus:outline-none focus:ring-1 ${
          errors[name] ? 'focus:ring-red-500' : 'focus:ring-green-500'
        } text-xs`}
        style={{
          fontSize: '12px',
          fontWeight: '100',
          ...(placeholder && {
            '::placeholder': {
              fontSize: '12px',
            },
          }),
        }}
      />
      {label && (
        <label htmlFor={name} className='absolute top-2 left-2 text-xs'>
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
        <p className='text-red-500 text-sm mt-1'>
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

export default Input;
