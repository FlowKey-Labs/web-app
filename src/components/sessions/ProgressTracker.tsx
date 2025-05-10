import CustomRingProgress from '../common/CustomRingProgress';
import {
  Progress,
  Card,
  Text,
  Button,
  Group,
  SimpleGrid,
  Box,
  Flex,
  Divider,
  Badge,
} from '@mantine/core';
import {
  IconChevronRight,
  IconMoodSmile,
  IconUserBolt,
} from '@tabler/icons-react';

import previewEyeIcon from '../../assets/icons/previewEye.svg';

const ProgressTracker = () => {
  return (
    <Box>
      <Card shadow='sm' padding='md' radius='lg' withBorder mb='md'>
        <Flex justify='space-between' align='center'>
          <Flex align='center' gap='lg'>
            <CustomRingProgress
              size={150}
              thickness={10}
              roundCaps
              sections={[{ value: 60, color: '#1D9B5E' }]}
              label={
                <Flex direction='column' justify='center' align='center'>
                  <Text size='10px' c='black'>
                    Completion
                  </Text>
                  <Text c='#1D9B5E' fw={700} ta='center' size='xl'>
                    60%
                  </Text>
                </Flex>
              }
            />
            <Box>
              <Text size='lg' fw={600} c='#8A8D8E'>
                STARFISH Series
              </Text>
              <Text size='sm' c='#8A8D8E'>
                Current track progress
              </Text>
            </Box>
          </Flex>
          <Button
            leftSection={<img src={previewEyeIcon} alt='Preview' />}
            color='#1D9B5E'
            radius='md'
            size='md'
          >
            Preview
          </Button>
        </Flex>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md' mb='md'>
        <Card shadow='sm' padding='xl' radius='lg' withBorder>
          <Flex align='center' gap='sm' mb='xl'>
            <IconMoodSmile size={24} color='#1D9B5E' />
            <Text fw={600} size='lg' c='#8A8D8E'>
              Steady Learning Progress!
            </Text>
          </Flex>
          <Text size='md' c='dimmed' mb='md'>
            Your guidance has clearly made a positive impact!
          </Text>
          <Text size='xs' c='dimmed' mb='xl'>
            Jakes Muli has made a steady strides in their learning journey. A
            testament to both their dedication and your effective instruction
          </Text>

          <Flex justify='space-between' align='center' mb='xs'>
            <Text size='xs' c='#0F2028'>
              Progress
            </Text>
            <Badge size='md' c='#1D9B5E' fw={500} bg='#ECFDF3'>
              60% ↑
            </Badge>
          </Flex>
          <Progress value={60} color='#1D9B5E' radius='sm' mb='sm' />
          <Text size='sm' fw={500} c='#8A8D8E'>
            Current Learning Progress
          </Text>
        </Card>

        <Box>
          <Card shadow='sm' padding='xl' radius='lg' withBorder mb='md'>
            <Flex justify='space-between' align='center'>
              <Box w='70%'>
                <Text fw={600} c='#8A8D8E'>
                  Jump right back
                </Text>
                <Text size='xs' c='#8A8D8E'>
                  Level 2
                </Text>
                <Progress value={50} color='#FF9500' radius='sm' mt='sm' />
                <Button
                  variant='transparent'
                  color='#0F2028'
                  rightSection={<IconChevronRight size={14} />}
                  p={0}
                  mt='sm'
                  size='sm'
                >
                  Continue Learning
                </Button>
              </Box>
              <Divider orientation='vertical' size='xs' />
              <Text size='2rem' fw={600} c='#8A8D8E'>
                0%
              </Text>
            </Flex>
          </Card>

          <Card shadow='sm' padding='lg' radius='lg' withBorder>
            <Flex justify='space-between' align='center'>
              <Box w='70%'>
                <Text fw={600} c='#8A8D8E'>
                  Average Assessment Score
                </Text>
                <Text size='xs' c='#8A8D8E'>
                  Based on validated Checkpoints
                </Text>
                <Button
                  variant='transparent'
                  color='#0F2028'
                  rightSection={<IconChevronRight size={14} />}
                  p={0}
                  mt='sm'
                  size='sm'
                >
                  View Report
                </Button>
              </Box>
              <Divider orientation='vertical' size='xs' />
              <Text size='2rem' fw={600} c='#8A8D8E'>
                0%
              </Text>
            </Flex>
          </Card>
        </Box>
      </SimpleGrid>

      <Card shadow='sm' radius='lg' withBorder p='0rem'>
        <Flex align='stretch' gap='md'>
          <Flex
            direction='row'
            align='center'
            p='md'
            style={{
              backgroundColor: 'var(--mantine-color-green-5)',
              flex: 1.5,
              borderRadius: 'var(--mantine-radius-lg)',
            }}
          >
            <Box ta='center' pr='md' w='30%'>
              <Text size='2rem' fw={600} c='white'>
                100%
              </Text>{' '}
              <Text size='10px' c='white' mt='xs'>
                Avg presence
              </Text>
            </Box>
            <Divider orientation='vertical' color='rgba(255,255,255,0.5)' />
            <Flex direction='column' align='center' pl='md' gap='sm'>
              <IconUserBolt size={14} color='white' className='self-start' />
              <Text size='xs' c='white'>
                Excellent presence and engagement. A dedicated student worth
                acknowledging!
              </Text>
            </Flex>
          </Flex>
          <Flex
            direction='column'
            justify='center'
            align='center'
            p='md'
            style={{ flex: 1 }}
          >
            <Text size='2rem' fw={500}>
              12
              <Text component='span' size='1rem' c='dimmed' fw={500}>
                /16
              </Text>
            </Text>
            <Text size='sm' c='dimmed'>
              Total Assessments
            </Text>
          </Flex>
          <Divider orientation='vertical' />
          <Flex
            direction='column'
            justify='center'
            align='center'
            p='md'
            style={{ flex: 1 }}
            pos='relative'
          >
            <Text size='2rem' fw={500}>
              1
            </Text>
            <Text size='xs' c='dimmed'>
              Total Absences
            </Text>
            <Button
              variant='transparent'
              color='#1D9B5E'
              rightSection={<IconChevronRight size={14} />}
              p={0}
              pos='absolute'
              top={10}
              right={10}
              styles={{ label: { fontSize: 'var(--mantine-font-size-xs)' } }}
            >
              Attendance
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
};

export default ProgressTracker;
