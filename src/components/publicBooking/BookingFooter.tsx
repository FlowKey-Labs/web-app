import React from 'react';
import { Group, Text, ActionIcon, Box, Button } from '@mantine/core';
import { FlowKeyIcon } from '../../assets/icons';

export function BookingFooter() {
  const handleCookieSettings = () => {
    console.log('Cookie settings clicked');
  };

  const handleSupport = () => {
    window.open('mailto:support@flowkeylabs.com', '_blank');
  };

  return (
    <Box mt="xl" pt="lg" style={{ borderTop: '1px solid #e9ecef' }}>
      <Group justify="space-between" align="center">

        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Powered by
          </Text>
          <Group gap="xs">
            <FlowKeyIcon className="w-4 h-4" style={{ color: '#1D9B5E' }} />
            <Text 
              size="sm" 
              fw={600} 
              style={{ 
                color: '#1D9B5E',
                cursor: 'pointer'
              }}
              onClick={() => window.open('https://flowkeylabs.com', '_blank')}
            >
              FlowKey
            </Text>
          </Group>
        </Group>


        <Group gap="md">
          <Button
            variant="subtle"
            size="sm"
            color="gray"
            onClick={handleCookieSettings}
            style={{ 
              color: '#6c757d',
              fontSize: '0.875rem',
              fontWeight: 400
            }}
          >
            Cookie settings
          </Button>
          
          <Button
            variant="subtle"
            size="sm"
            color="gray"
            onClick={handleSupport}
            style={{ 
              color: '#6c757d',
              fontSize: '0.875rem',
              fontWeight: 400
            }}
          >
            📞 Support
          </Button>
        </Group>
      </Group>
    </Box>
  );
} 