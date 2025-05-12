import React, { useState } from 'react';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import CustomRingProgress from '../common/CustomRingProgress';
import {
  Progress,
  Card,
  Text,
  Button,
  SimpleGrid,
  Box,
  Flex,
  Divider,
  Badge,
  Checkbox,
  Textarea,
} from '@mantine/core';
import {
  IconChevronRight,
  IconCheck,
  IconUpload,
  IconMoodSmile,
  IconUserBolt,
} from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import dropZoneIcon from '../../assets/icons/dropZone.svg';
import styles from '../accountSettings/GeneralSettings.module.css';
import previewEyeIcon from '../../assets/icons/previewEye.svg';
import Input from '../common/Input';

const ProgressTracker = () => {
  const methods = useForm({
    defaultValues: {
      feedback: '',
      attachments: [] as File[],
    },
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  // Preview mode data
  const previewLevelData = {
    title: 'Level 2',
    outcomes: [
      'Enter the pool safely with adult support',
      'Familiarize child with the water using swing dips',
      'Move freely around the pool on the front with adult support',
      'Move freely around the pool on the back with adult support',
      'Child to face adult and view them blowing bubbles',
      'Leave the pool safely with adult support',
    ],
    assessedOn: 'May 3, 2025',
    dueDate: 'May 3, 2025',
  };

  const outcomeStatus: { [key: string]: boolean } = {
    'Enter the pool safely with adult support': true,
  };

  if (isPreviewMode) {
    return (
      <FormProvider {...methods}>
        <Box className='w-full'>
          <Flex justify='space-between' align='center' mb='md'>
            <Text size='2rem' fw={700}>
              {previewLevelData.title}
            </Text>
            <Text size='sm' c='dimmed'>
              Due Date: {previewLevelData.dueDate}
            </Text>
          </Flex>
          <Text size='lg' fw={600} mb='xs'>
            Learning Outcomes
          </Text>
          <Text size='sm' c='dimmed' mb='lg'>
            Assessed on: {previewLevelData.assessedOn}
          </Text>
          <div className='space-y-3 mb-6'>
            {previewLevelData.outcomes.map((outcome, index) => {
              const isCompleted = outcomeStatus[outcome] || false;
              return (
                <Card
                  key={index}
                  padding='md'
                  radius='md'
                  withBorder
                  bg='#DEDEDE66'
                  className={`flex items-start space-x-3 ${
                    isCompleted ? 'bg-green-50' : 'bg-white'
                  }`}
                >
                  <Flex justify='space-between' align='center' gap='md'>
                    <Checkbox
                      checked={isCompleted}
                      readOnly
                      color='green'
                      radius='xl'
                      icon={IconCheck}
                      size='md'
                    />
                    <Box>
                      <Text size='sm' fw={500} c={isCompleted ? 'dimmed' : 'black'}>
                        {outcome}
                      </Text>
                      {isCompleted && (
                        <Text size='xs' c='green'>
                          Completed
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </Card>
              );
            })}
          </div>

          <Controller
            name='feedback'
            control={methods.control}
            render={({ field }) => (
              <Input
                label='Feedback'
                type='textarea'
                placeholder='Enter your feedback'
                rows={4}
                {...field}
              />
            )}
          />

          <Text size='sm' fw={500} mb='xs'>
            Attach Photos or videos
          </Text>
          <Controller
            name='attachments'
            control={methods.control}
            render={({ field: { onChange, value } }) => (
              <Dropzone
                onDrop={(files) => onChange([...(value || []), ...files])}
                onReject={(files) => console.log('rejected files', files)}
                maxSize={20 * 1024 ** 2}
                className={styles.dropzoneRoot}
                accept={IMAGE_MIME_TYPE}
              >
                <Flex justify='center' align='center' gap='md'>
                  <img src={dropZoneIcon} className='text-gray-500 w-8 h-8' />
                  <Box>
                    <Text size='sm' c='dimmed'>
                      Drag and drop a file here, or{' '}
                      <Text component='span' c='secondary' fw={500}>
                        Browse
                      </Text>
                    </Text>
                    <Text size='xs' c='dimmed'>
                      Max size: 20MB
                    </Text>
                  </Box>
                </Flex>
              </Dropzone>
            )}
          />
          <Controller
            name='attachments'
            control={methods.control}
            render={({ field: { value } }) => (
              <div className='mb-4'>
                {value?.map((file: File, index: number) => (
                  <div key={index} className='flex items-center mb-2'>
                    <Text size='sm'>{file.name}</Text>
                    <Button
                      variant='subtle'
                      color='red'
                      size='xs'
                      ml='sm'
                      onClick={() => {
                        const newFiles = [...(value || [])];
                        newFiles.splice(index, 1);
                        methods.setValue('attachments', newFiles);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          />
          <Flex justify='space-between' mt='xl'>
            <Button
              variant='outline'
              color='#1D9B5E'
              radius='md'
              size='sm'
              onClick={() => setIsPreviewMode(false)}
            >
              Back
            </Button>
            <Button 
              color='#1D9B5E' 
              radius='md' 
              size='sm'
              onClick={methods.handleSubmit(onSubmit)}
            >
              Next
            </Button>
          </Flex>
        </Box>
      </FormProvider>
    );
  }

  return (
    <Box className='w-full'>
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
            onClick={() => setIsPreviewMode(true)}
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