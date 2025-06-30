import React from 'react';
import { Card, Text, Button, Group, Badge, Divider, Alert } from '@mantine/core';
import { Client, ClientSource } from '../../types/clientTypes';

// SVG component for info icon
const InfoCircleIcon = ({ className }: { className?: string }) => (
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
      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" 
    />
  </svg>
);

interface ClientConversionPanelProps {
  client: Client;
  onConvertToRegular?: (clientId: number) => Promise<void>;
  onConvertToBooking?: (clientId: number) => Promise<void>;
  isConverting?: boolean;
}

const ClientConversionPanel: React.FC<ClientConversionPanelProps> = ({
  client,
  onConvertToRegular,
  onConvertToBooking,
  isConverting = false
}) => {
  const isBookingClient = client.source === 'booking_link';
  const isRegularClient = client.source === 'manual';

  const getClientTypeInfo = () => {
    if (isBookingClient) {
      return {
        type: 'Booking Client',
        color: 'blue',
        description: 'Client created through booking link system',
        capabilities: [
          'Limited to approved sessions only',
          'Cannot book makeup classes without approval',
          'Email notifications for booking status',
          'Limited profile editing capabilities'
        ],
        restrictions: [
          'Cannot be manually assigned to arbitrary sessions',
          'Attendance tracking limited to booked sessions',
          'Profile changes require re-verification'
        ]
      };
    }
    
    return {
      type: 'Regular Client',
      color: 'gray',
      description: 'Manually created client with full privileges',
      capabilities: [
        'Full session assignment flexibility',
        'Makeup class booking without approval',
        'Complete attendance tracking',
        'Full profile editing capabilities',
        'Group assignment options'
      ],
      restrictions: []
    };
  };

  const clientInfo = getClientTypeInfo();

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <div className="space-y-4">
        <Group justify="space-between">
          <Group>
            <Text size="lg" fw={600}>Client Type</Text>
            <Badge color={clientInfo.color} variant="light">
              {clientInfo.type}
            </Badge>
          </Group>
          
          {isBookingClient && onConvertToRegular && (
            <Button
              size="sm"
              variant="outline"
              color="green"
              onClick={() => onConvertToRegular(client.id)}
              loading={isConverting}
            >
              Convert to Regular Client
            </Button>
          )}
          
          {isRegularClient && onConvertToBooking && (
            <Button
              size="sm"
              variant="outline"
              color="blue"
              onClick={() => onConvertToBooking(client.id)}
              loading={isConverting}
            >
              Convert to Booking Client
            </Button>
          )}
        </Group>

        <Text size="sm" c="dimmed">
          {clientInfo.description}
        </Text>

        <div className="space-y-3">
          <div>
            <Text size="sm" fw={500} mb="xs">Capabilities:</Text>
            <ul className="list-disc list-inside space-y-1">
              {clientInfo.capabilities.map((capability, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {capability}
                </li>
              ))}
            </ul>
          </div>

          {clientInfo.restrictions.length > 0 && (
            <div>
              <Text size="sm" fw={500} mb="xs" c="orange">Restrictions:</Text>
              <ul className="list-disc list-inside space-y-1">
                {clientInfo.restrictions.map((restriction, index) => (
                  <li key={index} className="text-sm text-orange-600">
                    {restriction}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isBookingClient && (
          <Alert
            icon={<InfoCircleIcon className="w-4 h-4" />}
            title="Booking Client Guidelines"
            color="blue"
            variant="light"
          >
            <div className="space-y-2">
              <Text size="xs">
                <strong>Session Management:</strong> When editing sessions, booking clients appear 
                with "(Booking Client)" label in dropdowns. Use caution when modifying their 
                session assignments as it may conflict with their booking approval workflow.
              </Text>
              <Text size="xs">
                <strong>Attendance:</strong> Mark attendance normally, but be aware that attendance 
                affects their booking history and future approval probability.
              </Text>
              <Text size="xs">
                <strong>Profile Changes:</strong> Major profile changes (email, phone) may require 
                client re-verification for security purposes.
              </Text>
            </div>
          </Alert>
        )}

        {client.booking_request_id && (
          <Divider />
        )}

        {client.booking_request_id && (
          <div>
            <Text size="sm" fw={500} mb="xs">Booking History:</Text>
            <Text size="xs" c="dimmed">
              Original booking request ID: #{client.booking_request_id}
            </Text>
            <Text size="xs" c="dimmed">
              Client created from approved booking on {new Date(client.created_at).toLocaleDateString()}
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ClientConversionPanel; 