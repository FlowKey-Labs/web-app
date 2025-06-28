import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Avatar,
  Badge,
  Divider,
  Box,
} from "@mantine/core";
import { LocationIcon, PhoneIcon, EmailIcon, ClockIcon } from "./bookingIcons";
import { PublicBusinessInfo } from "../../types/clientTypes";
import { useBookingFlow } from "./PublicBookingProvider";

interface BusinessProfileCardProps {
  businessInfo: PublicBusinessInfo;
}

export function BusinessProfileCard({
  businessInfo,
}: BusinessProfileCardProps) {
  const { state } = useBookingFlow();

  return (
    <Paper
      shadow="sm"
      radius="lg"
      p="xl"
      style={{
        backgroundColor: "white",
        border: "1px solid #e9ecef",
        position: "sticky",
        top: "2rem",
      }}
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Group gap="sm">
            <Avatar
              size="lg"
              radius="md"
              style={{
                backgroundColor: "#1D9B5E",
                color: "white",
                fontWeight: 600,
                fontSize: "1.2rem",
              }}
            >
              {businessInfo.business_name.charAt(0).toUpperCase()}
            </Avatar>
            <Stack gap={2}>
              <Title
                order={3}
                size="h4"
                style={{ color: "#212529", lineHeight: 1.2 }}
              >
                {businessInfo.business_name}
              </Title>
              <Badge
                variant="light"
                color="gray"
                size="sm"
                style={{ textTransform: "capitalize" }}
              >
                {businessInfo.business_type}
              </Badge>
            </Stack>
          </Group>

          {businessInfo.about && (
            <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
              {businessInfo.about}
            </Text>
          )}
        </Stack>

        {(businessInfo.address || businessInfo.phone || businessInfo.email) && (
          <>
            <Divider />
            <Stack gap="xs">
              {businessInfo.address && (
                <Group gap="xs" wrap="nowrap">
                  <LocationIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.4 }}>
                    {businessInfo.address}
                  </Text>
                </Group>
              )}
              {businessInfo.phone && (
                <Group gap="xs" wrap="nowrap">
                  <PhoneIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <Text size="sm" c="dimmed">
                    {businessInfo.phone}
                  </Text>
                </Group>
              )}
              {businessInfo.email && (
                <Group gap="xs" wrap="nowrap">
                  <EmailIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <Text size="sm" c="dimmed">
                    {businessInfo.email}
                  </Text>
                </Group>
              )}
            </Stack>
          </>
        )}

        {state.selectedService && (
          <>
            <Divider />
            <Stack gap="sm">
              <Text size="sm" fw={600} c="dark">
                Selected Service
              </Text>
              <Box
                p="sm"
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <Text size="sm" fw={500} mb="xs">
                  {state.selectedService.name}
                </Text>
                <Group gap="md">
                  <Group gap="xs">
                    <ClockIcon className="w-3 h-3 text-gray-500" />
                    <Text size="xs" c="dimmed">
                      {state.selectedService.duration_minutes} min
                    </Text>
                  </Group>
                  {state.selectedService.price && (
                    <Text size="xs" fw={600} style={{ color: "#1D9B5E" }}>
                      ${state.selectedService.price}
                    </Text>
                  )}
                </Group>
              </Box>
            </Stack>
          </>
        )}

        {state.selectedDate && state.selectedSlot && (
          <>
            <Divider />
            <Stack gap="sm">
              <Text size="sm" fw={600} c="dark">
                Selected Time
              </Text>
              <Box
                p="sm"
                style={{
                  backgroundColor: "#f0f9ff",
                  borderRadius: "8px",
                  border: "1px solid #bae6fd",
                }}
              >
                <Text size="sm" fw={500} mb="xs">
                  {new Date(state.selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <Text size="xs" c="dimmed">
                  {state.selectedSlot.start_time} -{" "}
                  {state.selectedSlot.end_time}
                </Text>
                {state.selectedSlot.location && (
                  <Text size="xs" c="dimmed" mt="xs">
                    📍 {state.selectedSlot.location}
                  </Text>
                )}
              </Box>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
