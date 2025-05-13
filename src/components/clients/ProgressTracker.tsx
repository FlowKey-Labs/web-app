import { useState, useEffect, useMemo } from 'react';
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
} from '@mantine/core';
import {
  IconChevronRight,
  IconCheck,
  IconMoodSmile,
  IconUserBolt,
} from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import dropZoneIcon from '../../assets/icons/dropZone.svg';
import styles from '../accountSettings/GeneralSettings.module.css';
import previewEyeIcon from '../../assets/icons/previewEye.svg';
import Input from '../common/Input';

interface SeriesLevel {
  label: string;
  value: string;
  progress?: number;
}

interface Series {
  title: string;
  progress?: number;
  levels?: SeriesLevel[];
}

interface ProgressTrackerProps {
  setViewMode: (mode: 'details' | 'levels') => void;
  selectedLevel: {
    series: string;
    level: SeriesLevel;
  } | null;
  onProgressUpdate?: (levelId: string, progress: number) => void;
  levelProgress?: { [key: string]: number };
  seriesData?: Series[];
}

type PreviewLevelData = {
  title: string;
  outcomes: string[];
  assessedOn: string;
  dueDate: string;
};

// Level outcomes data
const levelOutcomes: { [key: string]: string[] } = {
  'starfish-1': [
    'Enter the pool safely with adult support',
    'Familiarize child with the water using swing dips',
    'Move freely around the pool on the front with adult support',
    'Move freely around the pool on the back with adult support',
    'Child to face adult and view them blowing bubbles',
    'Leave the pool safely with adult support',
  ],
  'starfish-2': [
    'Submerge face in the water with confidence',
    'Float on back independently for 5 seconds',
    'Kick legs while holding pool edge',
    'Blow bubbles underwater for 3 seconds',
    'Push and glide from wall with assistance',
    'Retrieve object from pool bottom in chest-deep water',
  ],
  'starfish-3': [
    'Swim 5 meters using any stroke',
    'Tread water for 10 seconds',
    'Perform basic freestyle arm movements',
    'Jump into deep water with confidence',
    'Float transition from front to back',
    'Demonstrate basic water safety skills',
  ],
  'stanley-1': [
    'Enter and exit pool safely using steps',
    'Blow bubbles with mouth and nose submerged',
    'Front float with support for 3 seconds',
    'Back float with support for 3 seconds',
    'Push and glide on front with face in water',
    'Kick with a float board for 5 meters',
  ],
};

const ProgressTracker = ({
  setViewMode,
  selectedLevel,
  onProgressUpdate,
  levelProgress = {},
  seriesData = [],
}: ProgressTrackerProps) => {
  const calculateSeriesProgress = (series: Series) => {
    if (!series.levels || series.levels.length === 0) {
      return 0;
    }
    const totalProgress = series.levels.reduce((sum, level) => {
      return sum + (levelProgress[level.value] || 0);
    }, 0);
    return Math.round(totalProgress / series.levels.length);
  };
  const methods = useForm({
    defaultValues: {
      feedback: '',
      attachments: [] as File[],
    },
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [previewLevelOutcomePercentage, setPreviewLevelOutcomePercentage] =
    useState(0);

  // Sync preview mode with view mode
  useEffect(() => {
    if (!isPreviewMode) {
      setViewMode('details');
    }
  }, [isPreviewMode, setViewMode]);

  useEffect(() => {
    if (selectedLevel) {
      setCompletionPercentage(selectedLevel.level.progress || 0);
    }
  }, [selectedLevel]);

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  // Preview mode data
  const previewLevelData: PreviewLevelData | null = useMemo(
    () =>
      selectedLevel
        ? {
            title: selectedLevel.level.label,
            outcomes: levelOutcomes[selectedLevel.level.value] || [],
            assessedOn: new Date().toLocaleDateString(),
            dueDate: new Date().toLocaleDateString(),
          }
        : null,
    [selectedLevel]
  );

  const [outcomeStatus, setOutcomeStatus] = useState<{
    [key: string]: boolean;
  }>({
    'Enter the pool safely with adult support': true,
    // Initialize other outcomes as false or based on actual data if available
  });

  const handleOutcomeToggle = (outcome: string) => {
    setOutcomeStatus((prevStatus) => ({
      ...prevStatus,
      [outcome]: !prevStatus[outcome],
    }));
  };

  useEffect(() => {
    if (!previewLevelData?.outcomes) return;
    const totalOutcomes = previewLevelData.outcomes.length;
    if (totalOutcomes > 0) {
      const completedOutcomes = previewLevelData.outcomes.filter(
        (outcome) => outcomeStatus[outcome]
      ).length;
      const percentage = Math.round((completedOutcomes / totalOutcomes) * 100);
      setPreviewLevelOutcomePercentage(percentage);
      onProgressUpdate?.(selectedLevel?.level?.value || '', percentage);
    } else {
      setPreviewLevelOutcomePercentage(0);
      if (selectedLevel && onProgressUpdate) {
        onProgressUpdate(selectedLevel.level.value, 0);
      }
    }
  }, [outcomeStatus, previewLevelData?.outcomes, selectedLevel]);

  if (isPreviewMode && previewLevelData) {
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
                      onChange={() => handleOutcomeToggle(outcome)}
                      color='green'
                      radius='xl'
                      icon={IconCheck}
                      size='md'
                    />
                    <Box>
                      <Text
                        size='sm'
                        fw={500}
                        c={isCompleted ? 'dimmed' : 'black'}
                      >
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
              sections={[{ value: completionPercentage, color: '#1D9B5E' }]}
              label={
                <Flex direction='column' justify='center' align='center'>
                  <Text size='10px' c='black'>
                    Completion
                  </Text>
                  <Text size='16px' fw={600} c='#1D9B5E' mt='xs'>
                    {selectedLevel && seriesData.length > 0
                      ? calculateSeriesProgress(
                          seriesData.find(
                            (s) => s.title === selectedLevel.series
                          ) || seriesData[0]
                        ) === 100
                        ? '100%'
                        : `${calculateSeriesProgress(
                            seriesData.find(
                              (s) => s.title === selectedLevel.series
                            ) || seriesData[0]
                          )}%`
                      : '0%'}
                  </Text>
                </Flex>
              }
            />
            <Box>
              <Text size='lg' fw={600} c='#8A8D8E'>
                {selectedLevel?.series || 'No Series Selected'}
              </Text>
              <Text size='xs' c='#8A8D8E'>
                Current Track Progress
              </Text>
            </Box>
          </Flex>
          <Button
            leftSection={<img src={previewEyeIcon} alt='Preview' />}
            color='#1D9B5E'
            radius='md'
            size='md'
            onClick={() => {
              setIsPreviewMode(true);
              setViewMode('levels');
            }}
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
              {calculateSeriesProgress(
                seriesData.find((s) => s.title === selectedLevel?.series) ||
                  seriesData[0]
              )}
              % ↑
            </Badge>
          </Flex>
          <Progress
            value={
              selectedLevel && seriesData.length > 0
                ? calculateSeriesProgress(
                    seriesData.find((s) => s.title === selectedLevel.series) ||
                      seriesData[0]
                  )
                : 0
            }
            color='#1D9B5E'
            radius='sm'
            mb='sm'
          />
          <Text size='sm' fw={500} c='#8A8D8E'>
            Current Learning Progress
          </Text>
        </Card>

        <Box>
          {previewLevelData && !isPreviewMode ? (
            <Card shadow='sm' padding='xl' radius='lg' withBorder mb='md'>
              <Flex justify='space-between' align='center'>
                <Box w='70%'>
                  <Text fw={600} c='#8A8D8E'>
                    Jump right back
                  </Text>
                  <Text size='xs' c='#8A8D8E'>
                    {selectedLevel?.series}
                  </Text>
                  <Progress
                    value={previewLevelOutcomePercentage}
                    color='#FF9500'
                    radius='sm'
                    mt='sm'
                  />
                  <Button
                    variant='transparent'
                    color='#0F2028'
                    rightSection={<IconChevronRight size={14} />}
                    p={0}
                    mt='sm'
                    size='sm'
                    onClick={() => {
                      setIsPreviewMode(true);
                      setViewMode('levels');
                    }}
                  >
                    Continue Learning
                  </Button>
                </Box>
                <Divider orientation='vertical' size='xs' />
                <Text size='2rem' fw={600} c='#8A8D8E'>
                  {previewLevelOutcomePercentage}%
                </Text>
              </Flex>
            </Card>
          ) : (
            <Card shadow='sm' padding='xl' radius='lg' withBorder mb='md'>
              <Flex justify='space-between' align='center'>
                <Box w='70%'>
                  <Text fw={600} c='#8A8D8E'>
                    Jump right back
                  </Text>
                  <Text size='xs' c='#8A8D8E'>
                    {selectedLevel?.series}
                  </Text>
                  <Progress
                    value={completionPercentage}
                    color='#FF9500'
                    radius='sm'
                    mt='sm'
                  />
                  <Button
                    variant='transparent'
                    color='#0F2028'
                    rightSection={<IconChevronRight size={14} />}
                    p={0}
                    mt='sm'
                    size='sm'
                    onClick={() => {
                      setIsPreviewMode(true);
                      setViewMode('levels');
                    }}
                  >
                    Continue Learning
                  </Button>
                </Box>
                <Divider orientation='vertical' size='xs' />
                <Text size='2rem' fw={600} c='#8A8D8E'>
                  {previewLevelOutcomePercentage}%
                </Text>
              </Flex>
            </Card>
          )}
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
