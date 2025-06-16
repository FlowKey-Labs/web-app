import React, { useState, useMemo } from 'react';
import { Select, MultiSelect, Group, Badge, Text, Divider, ScrollArea } from '@mantine/core';
import { Client, ClientSource } from '../../types/clientTypes';
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
  onCreateNew?: () => void;
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
  onCreateNew,
  showBookingWarning = false,
  operationType = 'add'
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingValue, setPendingValue] = useState<string | string[] | null>(null);

  const { regularClients, bookingClients, groupedOptions } = useMemo(() => {
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
      regularClients: regular,
      bookingClients: booking,
      groupedOptions: grouped
    };
  }, [clients]);

  const handleValueChange = (newValue: string | string[]) => {
    if (!showBookingWarning) {
      onChange(newValue);
      return;
    }

    // Check if any selected clients are booking clients
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

  const renderOption = (option: ClientOption) => (
    <Group justify="space-between" style={{ width: '100%' }}>
      <Text size="sm">{option.label}</Text>
      <Badge
        size="xs"
        color={option.group === 'booking' ? 'blue' : 'gray'}
        variant="light"
      >
        {option.group === 'booking' ? 'Booking' : 'Regular'}
      </Badge>
    </Group>
  );

  // Prepare data for Mantine components
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

  const commonProps = {
    label,
    placeholder,
    disabled: disabled || isLoading,
    searchable: true,
    clearable: true,
    maxDropdownHeight: 300,
    value,
    data: selectData,
    onChange: handleValueChange
  };

  if (multiple) {
    return (
      <MultiSelect
        {...commonProps}
        value={value as string[]}
      />
    );
  }

  return (
    <Select
      {...commonProps}
      value={value as string}
    />
  );
};

export default EnhancedClientDropdown; 