import React, { useEffect, useMemo, useState } from 'react';
import Select, { components, CSSObjectWithLabel } from 'react-select';
import { useUIStore, DrawerType } from '../../store/ui';

export type DropDownItem = {
  label: string;
  value: string | number;
  code?: string | number;
  isCreateOption?: boolean;
  subLabel?: string;
  status?: 'active' | 'inactive' | 'pending';
  drawerType?: DrawerType;
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
  createLabel?: string;
  onCreateNew?: () => void;
  createDrawerType?: DrawerType;
};

const Option = (props: any) => {
  const { isSelected, selectOption, data, selectProps } = props;
  const label = data.label;
  const isCreateOption = data.isCreateOption;
  const subLabel = data.subLabel;
  const status = data.status;
  const drawerType = data?.drawerType;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    selectOption(data);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!selectProps?.isMulti) {
      e.stopPropagation();
      selectOption(data);
    }
  };

  const getTooltipText = () => {
    if (!drawerType) return 'Click to open creation form';

    switch (drawerType) {
      case 'session':
        return 'Click to open session creation form';
      case 'client':
        return 'Click to open client creation form';
      case 'staff':
        return 'Click to open staff creation form';
      case 'location':
        return 'Click to open location creation form';
      case 'category':
        return 'Click to open category creation form';
      case 'policy':
        return 'Click to open policy creation form';
      default:
        return `Click to open ${drawerType} creation form`;
    }
  };

  return (
    <components.Option {...props}>
      <div
        className={`flex items-center ${
          isCreateOption ? 'text-primary font-medium' : ''
        }`}
        onClick={!selectProps?.isMulti ? handleClick : undefined}
      >
        {selectProps?.isMulti && !isCreateOption && (
          <div
            className='mr-2'
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <input
              type='checkbox'
              checked={isSelected}
              onChange={handleChange}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className='cursor-pointer'
            />
          </div>
        )}
        {isCreateOption ? (
          <div
            className='flex items-center w-full px-1 py-0.5 rounded hover:bg-green-50 cursor-pointer group relative'
            role='button'
            tabIndex={0}
            aria-label={label}
          >
            <div className='flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center mr-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <line x1='12' y1='5' x2='12' y2='19'></line>
                <line x1='5' y1='12' x2='19' y2='12'></line>
              </svg>
            </div>
            <span className='text-primary'>{label}</span>
            <div className='absolute bottom-full left-0 mb-2 w-48 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50'>
              {getTooltipText()}
            </div>
          </div>
        ) : (
          <div className='flex flex-col w-full'>
            <div className='flex items-center justify-between w-full'>
              <span className='flex-1'>{label}</span>
              {status && (
                <span
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {status}
                </span>
              )}
            </div>
            {subLabel && (
              <span className='text-xs text-gray-500'>{subLabel}</span>
            )}
          </div>
        )}
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
  errorMessage,
  className,
  selectClassName,
  value,
  createLabel,
  onCreateNew,
  createDrawerType,
  ...props
}: Props & React.HTMLAttributes<HTMLDivElement>) {
  const [selectedValue, setSelectedValue] = useState<
    DropDownItem | DropDownItem[] | null
  >(() => {
    if (value) {
      if (Array.isArray(value)) {
        return options.filter((option) =>
          value.includes(option.value as string)
        );
      }
      return options.find((option) => option.value === value) || null;
    }
    return defaultValue || null;
  });

  useEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        setSelectedValue(
          options.filter((option) => value.includes(option.value as string))
        );
      } else {
        setSelectedValue(
          options.find((option) => option.value === value) || null
        );
      }
    } else {
      setSelectedValue(defaultValue || null);
    }
  }, [value, options, defaultValue]);

  const openDrawer = useUIStore((state) => state.openDrawer);

  const optionsWithCreate = useMemo(() => {
    if (createLabel && (onCreateNew || createDrawerType)) {
      return [
        {
          label: createLabel,
          value: 'create-new-option',
          isCreateOption: true,
          drawerType: createDrawerType,
        },
        ...options,
      ];
    }
    return options;
  }, [createLabel, onCreateNew, createDrawerType, options]);

  const sortedOptions = useMemo(() => {
    const createOption = optionsWithCreate.find((opt) => opt.isCreateOption);
    const normalOptions = optionsWithCreate
      .filter((opt) => !opt.isCreateOption)
      .sort((a, b) => a.label?.localeCompare(b.label));

    return createOption ? [createOption, ...normalOptions] : normalOptions;
  }, [optionsWithCreate]);

  const handleChange = (newValue: any) => {
    if (!newValue) {
      onSelectItem?.(null);
      setSelectedValue(null);
      return;
    }

    // Handle create new option
    if (!Array.isArray(newValue) && newValue.isCreateOption) {
      if (createDrawerType) {
        if (createDrawerType === 'session') {
          openDrawer({
            type: createDrawerType,
            isEditing: false,
            parentContext: {
              type: 'client',
              pendingData: { fromClientCreation: true },
            },
          });
        } else {
          openDrawer({
            type: createDrawerType,
            isEditing: false,
          });
        }
      } else if (onCreateNew) {
        onCreateNew();
      }
      return;
    }

    // Handle multi-select with create option in the selection
    if (
      Array.isArray(newValue) &&
      newValue.some((item: any) => item.isCreateOption)
    ) {
      if (createDrawerType) {
        openDrawer({
          type: createDrawerType,
          isEditing: false,
        });
      } else if (onCreateNew) {
        onCreateNew();
      }

      // Filter out the create option and update with remaining selections
      const filteredSelection = newValue.filter(
        (item: any) => !item.isCreateOption
      );
      if (filteredSelection.length > 0) {
        onSelectItem?.(filteredSelection);
        setSelectedValue(filteredSelection);
      }
      return;
    }

    // For single select, ensure we have a valid value object
    if (singleSelect && !Array.isArray(newValue)) {
      const select = document.querySelector('.react-select__menu');
      if (select) {
        (select as HTMLElement).style.display = 'none';
      }

      // Ensure we have a valid value object with label and value
      const selectedOption = options.find(
        (option) => option.value === newValue?.value
      );
      if (selectedOption) {
        onSelectItem?.(selectedOption);
        setSelectedValue(selectedOption);
      } else {
        onSelectItem?.(newValue);
        setSelectedValue(newValue);
      }
      return;
    }

    // For multi-select, update the selected values
    onSelectItem?.(newValue);
    setSelectedValue(newValue);
  };

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
      { isSelected, data }: { isSelected: boolean; data: DropDownItem }
    ) => ({
      ...base,
      '&:hover': {
        backgroundColor: data.isCreateOption ? '#e6f7ef' : '#DAF8E6',
        color: 'black',
      },
      backgroundColor: isSelected
        ? '#EAFCF3'
        : data.isCreateOption
        ? '#f9f9f9'
        : '',
      color: isSelected ? 'black' : '',
      borderBottom: data.isCreateOption ? '1px solid #e5e7eb' : 'none',
      paddingTop: data.isCreateOption ? '8px' : base.paddingTop,
      paddingBottom: data.isCreateOption ? '8px' : base.paddingBottom,
      marginBottom: data.isCreateOption ? '4px' : '0',
      marginTop: data.isCreateOption ? '0' : '0',
      cursor: data.isCreateOption ? 'pointer' : 'default',
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
        classNamePrefix='react-select'
        value={selectedValue}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        isMulti={!singleSelect}
        onChange={handleChange}
        isSearchable={isSearchable}
        options={sortedOptions}
        styles={customStyles}
        placeholder={placeholder}
        components={{ Option }}
        closeMenuOnSelect={singleSelect}
        hideSelectedOptions={false}
        controlShouldRenderValue={true}
        getOptionLabel={(option: any) => option?.label || ''}
        getOptionValue={(option: any) => option?.value?.toString() || ''}
        isOptionSelected={(option) => {
          if (!selectedValue) return false;
          if (Array.isArray(selectedValue)) {
            return selectedValue.some((item) => item.value === option.value);
          }
          return selectedValue.value === option.value;
        }}
      />
      {(hasError || errorMessage) && (
        <span className='text-xs text-red-500 mt-1'>{errorMessage}</span>
      )}
    </div>
  );
}
