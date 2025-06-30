import React from 'react';
import { Alert, Text, Button, Group, Badge } from '@mantine/core';
import { Client } from '../../types/clientTypes';

// SVG component for warning icon
const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
    />
  </svg>
);

interface BookingClientWarningProps {
  bookingClients: Client[];
  onContinue: () => void;
  onCancel?: () => void;
  operationType: 'add' | 'remove' | 'edit';
}

const BookingClientWarning: React.FC<BookingClientWarningProps> = ({
  bookingClients,
  onContinue,
  onCancel,
  operationType
}) => {
  if (bookingClients.length === 0) return null;

  const getOperationText = () => {
    switch (operationType) {
      case 'add':
        return 'add to this session';
      case 'remove':
        return 'remove from this session';
      case 'edit':
        return 'modify in this session';
      default:
        return 'modify';
    }
  };

  const getWarningMessage = () => {
    const clientNames = bookingClients.map(c => `${c.first_name} ${c.last_name}`).join(', ');
    const operation = getOperationText();
    
    if (bookingClients.length === 1) {
      return `You are about to ${operation} a booking client: ${clientNames}`;
    }
    
    return `You are about to ${operation} ${bookingClients.length} booking clients: ${clientNames}`;
  };

  const getImplications = () => {
    switch (operationType) {
      case 'add':
        return [
          'This may conflict with the client\'s original booking approval workflow',
          'The client may receive unexpected notifications about session changes',
          'Consider whether this client should be converted to a regular client first'
        ];
      case 'remove':
        return [
          'This will remove the client from a session they may have specifically booked',
          'The client will lose their approved booking slot',
          'Consider notifying the client manually about this change'
        ];
      case 'edit':
        return [
          'Session changes may affect the client\'s original booking agreement',
          'Time or date changes may conflict with the client\'s availability',
          'The client may need to re-confirm their availability for changed sessions'
        ];
      default:
        return [];
    }
  };

  return (
    <Alert
      icon={<ExclamationTriangleIcon className="w-5 h-5" />}
      title="Booking Client Detected"
      color="orange"
      variant="light"
      className="mb-4"
    >
      <div className="space-y-3">
        <Text size="sm">
          {getWarningMessage()}
        </Text>

        <div className="flex flex-wrap gap-2">
          {bookingClients.map(client => (
            <Badge key={client.id} color="blue" variant="outline" size="sm">
              {client.first_name} {client.last_name}
            </Badge>
          ))}
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">Potential implications:</Text>
          <ul className="list-disc list-inside space-y-1">
            {getImplications().map((implication, index) => (
              <li key={index} className="text-sm text-orange-700">
                {implication}
              </li>
            ))}
          </ul>
        </div>

        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
          )}
          <Button color="orange" onClick={onContinue} size="sm">
            Continue Anyway
          </Button>
        </Group>
      </div>
    </Alert>
  );
};

export default BookingClientWarning; 