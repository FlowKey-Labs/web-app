import React from 'react';
import { Box, Group, Avatar, Title, Text, Badge } from '@mantine/core';
import { FlowKeyIcon } from '../../assets/icons';
import { PublicBusinessInfo } from '../../types/clientTypes';

interface PublicBookingHeaderProps {
  businessInfo: PublicBusinessInfo;
}

export function PublicBookingHeader({ businessInfo }: PublicBookingHeaderProps) {
  return (
    <Box py="xl">
      {/* FlowKey Header */}
      <Box mb="xl">
        <Group gap="xs" mb="lg">
          <FlowKeyIcon className="w-8 h-8" style={{ color: '#1D9B5E' }} />
          <Text 
            size="xl" 
            fw={700} 
            style={{ 
              color: '#212529',
              letterSpacing: '-0.025em'
            }}
          >
            FlowKey
          </Text>
        </Group>
      </Box>

      {/* Business Profile */}
      <Group gap="lg" mb="lg">
        <Avatar 
          size={60} 
          radius="lg"
          style={{ 
            backgroundColor: '#1D9B5E',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.5rem'
          }}
        >
          {businessInfo.business_name.charAt(0).toUpperCase()}
        </Avatar>
        
        <Box>
          <Title 
            order={1} 
            size="h2" 
            mb="xs"
            style={{ 
              color: '#212529',
              fontWeight: 700,
              lineHeight: 1.2
            }}
          >
            {businessInfo.business_name}
          </Title>
          
          <Group gap="md" align="center">
            <Badge 
              variant="light" 
              color="gray" 
              size="md"
              style={{ 
                textTransform: 'capitalize',
                fontWeight: 500
              }}
            >
              {businessInfo.business_type}
            </Badge>
            
            {businessInfo.about && (
              <Text 
                size="md" 
                c="dimmed" 
                style={{ 
                  maxWidth: '500px',
                  lineHeight: 1.5
                }}
              >
                {businessInfo.about}
              </Text>
            )}
          </Group>
        </Box>
      </Group>
    </Box>
  );
} 