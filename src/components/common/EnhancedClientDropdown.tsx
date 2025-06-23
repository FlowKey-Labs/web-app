import React, { useState, useMemo } from 'react';
import { Select, MultiSelect } from '@mantine/core';
import { Client } from '../../types/clientTypes';
import BookingClientWarning from '../sessions/BookingClientWarning';

interface ClientOption {
  value: string;
  label: string;
  client: Client;
  group?: 'regular' | 'booking';
}

interface EnhancedClientDropdownProps {
  clients: Client[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  isLoading?: boolean;
  showBookingWarning?: boolean;
  operationType?: 'add' | 'remove' | 'edit';
}

const EnhancedClientDropdown: React.FC<EnhancedClientDropdownProps> = ({
  clients,
  value,
  onChange,
  multiple = false,
  placeholder = 'Select client(s)',
  label = 'Clients',
  disabled = false,
  isLoading = false,
  showBookingWarning = false,
  operationType = 'add'
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingValue, setPendingValue] = useState<string | string[] | null>(null);

  const { bookingClients, groupedOptions } = useMemo(() => {
    const regular = clients.filter(c => c.source === 'manual');
    const booking = clients.filter(c => c.source === 'booking_link');
    
    const regularOptions: ClientOption[] = regular.map(client => ({
      value: client.id.toString(),
      label: `${client.first_name} ${client.last_name}`,
      client,
      group: 'regular'
    }));

    const bookingOptions: ClientOption[] = booking.map(client => ({
      value: client.id.toString(),
      label: `${client.first_name} ${client.last_name}`,
      client,
      group: 'booking'
    }));

    const grouped = [
      {
        group: 'Regular Clients',
        items: regularOptions
      },
      {
        group: 'Booking Clients',
        items: bookingOptions
      }
    ].filter(g => g.items.length > 0);

    return {
      bookingClients: booking,
      groupedOptions: grouped
    };
  }, [clients]);

  const handleValueChange = (newValue: string | string[]) => {
    if (!showBookingWarning) {
      onChange(newValue);
      return;
    }

    const selectedIds = Array.isArray(newValue) ? newValue : [newValue];
    const selectedBookingClients = bookingClients.filter(c => 
      selectedIds.includes(c.id.toString())
    );

    if (selectedBookingClients.length > 0) {
      setPendingValue(newValue);
      setShowWarning(true);
      return;
    }

    onChange(newValue);
  };

  const handleWarningContinue = () => {
    if (pendingValue !== null) {
      onChange(pendingValue);
    }
    setShowWarning(false);
    setPendingValue(null);
  };

  const handleWarningCancel = () => {
    setShowWarning(false);
    setPendingValue(null);
  };

  const allOptions = groupedOptions.flatMap(g => g.items);
  const selectData = allOptions.map(option => ({
    value: option.value,
    label: option.label,
    group: option.group === 'booking' ? 'Booking Clients' : 'Regular Clients'
  }));

  if (showWarning && pendingValue) {
    const selectedIds = Array.isArray(pendingValue) ? pendingValue : [pendingValue];
    const affectedBookingClients = bookingClients.filter(c => 
      selectedIds.includes(c.id.toString())
    );

    return (
      <div>
        <BookingClientWarning
          bookingClients={affectedBookingClients}
          onContinue={handleWarningContinue}
          onCancel={handleWarningCancel}
          operationType={operationType}
        />
      </div>
    );
  }

  if (multiple) {
    return (
      <MultiSelect
        label={label}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        searchable={true}
        clearable={true}
        maxDropdownHeight={300}
        value={value as string[]}
        data={selectData}
        onChange={(newValue) => handleValueChange(newValue)}
      />
    );
  }

  return (
    <Select
      label={label}
      placeholder={placeholder}
      disabled={disabled || isLoading}
      searchable={true}
      clearable={true}
      maxDropdownHeight={300}
      value={value as string}
      data={selectData}
      onChange={(newValue) => handleValueChange(newValue || '')}
    />
  );
};

export default EnhancedClientDropdown; 