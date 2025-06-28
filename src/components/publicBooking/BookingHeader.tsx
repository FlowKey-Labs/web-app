import { Box, Title, Text, Group } from '@mantine/core';
import { FlowKeyIcon } from '../../assets/icons';
import { LocationIcon, PhoneIcon, EmailIcon } from './bookingIcons';
import { PublicBusinessInfo } from '../../types/clientTypes';

interface BookingHeaderProps {
  businessInfo: PublicBusinessInfo;
}

export function BookingHeader({ businessInfo }: BookingHeaderProps) {
  return (
    <Box
      style={{
        background: 'linear-gradient(135deg, #1D9B5E 0%, #16a085 100%)',
        color: 'white',
        padding: '2rem',
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Box>
          <Group gap="sm" mb="xs">
            <FlowKeyIcon className="w-6 h-6" />
            <Title order={2} size="h1" fw={700}>
              {businessInfo.business_name}
            </Title>
          </Group>
          {businessInfo.about && (
            <Text size="lg" opacity={0.9} maw={600}>
              {businessInfo.about}
            </Text>
          )}
        </Box>
      </Group>

      {(businessInfo.address || businessInfo.phone || businessInfo.email) && (
        <Group gap="xl" mt="lg">
          {businessInfo.address && (
            <Group gap="xs">
              <LocationIcon className="w-4 h-4" />
              <Text size="sm" opacity={0.9}>
                {businessInfo.address}
              </Text>
            </Group>
          )}
          {businessInfo.phone && (
            <Group gap="xs">
              <PhoneIcon className="w-4 h-4" />
              <Text size="sm" opacity={0.9}>
                {businessInfo.phone}
              </Text>
            </Group>
          )}
          {businessInfo.email && (
            <Group gap="xs">
              <EmailIcon className="w-4 h-4" />
              <Text size="sm" opacity={0.9}>
                {businessInfo.email}
              </Text>
            </Group>
          )}
        </Group>
      )}
    </Box>
  );
} 