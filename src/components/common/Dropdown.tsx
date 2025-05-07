import React, { useEffect, useMemo, useState } from 'react';
import Select, {
  components,
  MultiValue,
  SingleValue,
  CSSObjectWithLabel,
  OptionProps,
} from 'react-select';

export type DropDownItem = {
  label: string;
  value: string | number;
  code?: string | number;
};

type Props = {
  label?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isMulti?: boolean;
  options: DropDownItem[];
  defaultValue?: DropDownItem[] | DropDownItem | null;
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
  value?: string | string[];
};

const Option = (props: OptionProps<DropDownItem>) => {
  return (
    <components.Option {...props}>
      <div className='flex items-center'>
        {props.isMulti && (
          <input
            type='checkbox'
            checked={props.isSelected}
            onChange={() => null}
            className='mr-2'
          />
        )}
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
  singleSelect = true,
  hasError,
  onSelectItem,
  onRemoveItem,
  errorMessage,
  className,
  selectClassName,
  value,
  ...props
}: Props & React.HTMLAttributes<HTMLDivElement>) {
  const [selectedValue, setSelectedValue] = useState<
    MultiValue<DropDownItem> | SingleValue<DropDownItem>
  >();

  useEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        const selectedOptions = options.filter((option) =>
          value.includes(option.value.toString())
        );
        selectedOptions.length > 0 && setSelectedValue(selectedOptions);
      } else {
        const selectedOption = options.find(
          (option) => option.value.toString() === value
        );
        selectedOption && setSelectedValue(selectedOption);
      }
    } else if (defaultValue) {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue, value, options]);

  const sortedOptions = useMemo(
    () => options.sort((a, b) => a.label?.localeCompare(b.label)),
    [options]
  );

  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: label ? '58px' : '28px',
      backgroundColor: 'white',
      border: hasError ? '1px solid #FF0000' : '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      boxShadow: 'none',
      '&:hover': {
        border: hasError ? '1px solid #FF0000' : '1px solid #1D9B5E',
      },
      padding: label ? '20px 5px 5px' : '2px',
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
    option: (
      base: CSSObjectWithLabel,
      { isSelected }: { isSelected: boolean }
    ) => ({
      ...base,
      '&:hover': {
        backgroundColor: '#DAF8E6',
        color: 'black',
      },
      backgroundColor: isSelected ? '#EAFCF3' : '',
      color: isSelected ? 'black' : '',
    }),
  };

  return (
    <div className={`relative ${className}`} style={{ width }} {...props}>
      {label && (
        <label
          className={`absolute text-xs px-2 top-2 left-2 z-10 transition-all ${
            hasError ? 'text-red-500' : 'text-black'
          }`}
        >
          {label}
        </label>
      )}
      <Select
        className={selectClassName || 'w-full text-sm'}
        classNamePrefix={placeholder}
        value={selectedValue}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        isMulti={!singleSelect}
        onChange={(selectedItem) => {
          onSelectItem?.(selectedItem || { value: '' });
          setSelectedValue(selectedItem);
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
