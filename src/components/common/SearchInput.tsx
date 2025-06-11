import React, { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ leftIcon, containerClassName, inputClassName, ...props }, ref) => {
    return (
      <div
        className={twMerge(
          'relative flex items-center w-full',
          containerClassName
        )}
      >
        {leftIcon && (
          <div className='absolute left-4 top-1/2 -translate-y-1/2'>
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={twMerge(
            'w-full h-12 pl-16 pr-4 text-sm text-primary bg-white shade-sm rounded-md',
            'placeholder:text-gray-400 outline-none text-sm transition-all duration-200',
            'hover:border-gray-300',
            inputClassName
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
