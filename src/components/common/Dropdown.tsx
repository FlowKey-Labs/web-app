import React, { useEffect, useMemo, useState } from 'react';
import Select, { components, MultiValue, SingleValue } from 'react-select';

export type DropDownItem = {
  label: string;
  value: string | number;
  code?: string | number;
};

type Props = {
  label: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isMulti?: boolean;
  options: DropDownItem[];
  defaultValue?: MultiValue<DropDownItem> | SingleValue<DropDownItem>;
  placeholder?: string;
  width?: string | number;
  selectionLimit?: number;
  singleSelect?: boolean;
  hasError?: boolean;
  onSelectItem: (x: any) => void;
  onRemoveItem?: (x: any, list: any[]) => void;
  errorMessage?: string;
  selectedValues?: any;
  className?: string;
  selectClassName?: string;
};

const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <div className='flex items-center'>
        <input
          type='checkbox'
          checked={props.isSelected}
          onChange={() => null}
          className='mr-2'
        />
        <label>{props.label}</label>
      </div>
    </components.Option>
  );
};

export default function DropdownSelectInput({
  label,
  options,
  isDisabled,
  isLoading,
  isClearable = true,
  isSearchable = true,
  width = '100%',
  placeholder = 'Select',
  defaultValue,
  singleSelect,
  hasError,
  onSelectItem,
  onRemoveItem,
  errorMessage,
  className,
  selectClassName,
  ...props
}: Props & React.HTMLAttributes<HTMLDivElement>) {
  const [value, setValue] = useState<
    MultiValue<DropDownItem> | SingleValue<DropDownItem>
  >();

  useEffect(() => {
    defaultValue && setValue(defaultValue);
  }, [defaultValue]);

  const sortedOptions = useMemo(
    () => options.sort((a, b) => a.label.localeCompare(b.label)),
    [options]
  );

  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '42px',
      backgroundColor: 'white',
      border: hasError ? '1px solid #FF0000' : '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      boxShadow: 'none',
      '&:hover': {
        border: hasError ? '1px solid #FF0000' : '1px solid #E5E7EB',
      },
      padding: '2px 8px',
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#6B7280',
      fontSize: '12px', 
    }),
    input: (base: any) => ({
      ...base,
      margin: '0',
      padding: '0',
    }),
  };

  return (
    <div className={`relative ${className}`} style={{ width }} {...props}>
      {label && (
        <label
          className={`absolute text-xs bg-white px-2 -translate-y-1/2 left-3 z-10 transition-all ${
            hasError ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          {label}
        </label>
      )}
      <Select
        className={selectClassName || 'w-full'}
        classNamePrefix={placeholder}
        value={value}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        isMulti={!singleSelect}
        onChange={(selectedItem) => {
          onSelectItem?.(selectedItem || { value: '' });
          setValue(selectedItem);
        }}
        isSearchable={isSearchable}
        options={sortedOptions}
        styles={customStyles}
        placeholder={placeholder}
        components={{ Option }}
      />
      {(hasError || errorMessage) && (
        <span className='text-xs text-red-500 mt-1'>{errorMessage}</span>
      )}
    </div>
  );
}
