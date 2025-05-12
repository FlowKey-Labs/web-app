import { useState } from 'react';
import {
  Card,
  Text,
  Flex,
  Box,
  Accordion,
  Progress,
  Badge,
} from '@mantine/core';
import CustomRingProgress from '../common/CustomRingProgress';
import lockIcon from '../../assets/icons/Lock.svg';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';

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

const ProgressSeriesTracker = () => {
  const [selectedLevel, setSelectedLevel] = useState<{
    series: string;
    level: string;
  } | null>(null);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const seriesData: Series[] = [
    {
      title: 'STARFISH Series',
      progress: 20,
      levels: [
        { label: 'Level 1', value: 'starfish-1', progress: 20 },
        { label: 'Level 2', value: 'starfish-2', progress: 50 },
        { label: 'Level 3', value: 'starfish-3', progress: 70 },
        { label: 'Level 4', value: 'starfish-4', progress: 90 },
        { label: 'Level 5', value: 'starfish-5', progress: 100 },
        { label: 'Level 6', value: 'starfish-6', progress: 100 },
      ],
    },
    {
      title: 'STANLEY Series',
      levels: [
        { label: 'Level 1', value: 'stanley-1', progress: 20 },
        { label: 'Level 2', value: 'stanley-2', progress: 50 },
        { label: 'Level 3', value: 'stanley-3', progress: 70 },
        { label: 'Level 4', value: 'stanley-4', progress: 90 },
        { label: 'Level 5', value: 'stanley-5', progress: 100 },
        { label: 'Level 6', value: 'stanley-6', progress: 100 },
      ],
    },
    {
      title: 'Octopus Series',
      levels: [
        { label: 'Level 1', value: 'octopus-1', progress: 20 },
        { label: 'Level 2', value: 'octopus-2', progress: 50 },
        { label: 'Level 3', value: 'octopus-3', progress: 70 },
        { label: 'Level 4', value: 'octopus-4', progress: 90 },
        { label: 'Level 5', value: 'octopus-5', progress: 100 },
        { label: 'Level 6', value: 'octopus-6', progress: 100 },
      ],
    },
    {
      title: 'Jellyfish Series',
      levels: [
        { label: 'Level 1', value: 'jellyfish-1', progress: 20 },
        { label: 'Level 2', value: 'jellyfish-2', progress: 50 },
        { label: 'Level 3', value: 'jellyfish-3', progress: 70 },
        { label: 'Level 4', value: 'jellyfish-4', progress: 90 },
        { label: 'Level 5', value: 'jellyfish-5', progress: 100 },
        { label: 'Level 6', value: 'jellyfish-6', progress: 100 },
      ],
    },
  ];

  const isSeriesComplete = (seriesIndex: number) => {
    if (seriesIndex === 0) return true;

    const prevSeries = seriesData[seriesIndex - 1];
    if (!prevSeries.levels) return true;

    return prevSeries.levels.every((level) => level.progress === 100);
  };

  const handleLevelSelect = (seriesTitle: string, level: SeriesLevel) => {
    setSelectedLevel({
      series: seriesTitle,
      level: level.label,
    });
  };

  const handleAccordionChange = (value: string) => {
    const seriesIndex = seriesData.findIndex((s) => s.title === value);
    if (seriesIndex > 0 && !isSeriesComplete(seriesIndex)) {
      return;
    }
    setExpandedSeries(expandedSeries === value ? null : value);
  };

  const renderProgressText = (progress?: number) => {
    if (progress === 100) {
      return (
        <Text color='#1D9B5E' size='xs'>
          Completed
        </Text>
      );
    }
    return `${progress}%`;
  };

  return (
    <Card padding='sm' radius='lg' w='90%' withBorder>
      <Accordion
        value={expandedSeries}
        onChange={(value) => handleAccordionChange(value || '')}
        chevron={null}
        styles={{
          item: {
            width: '100%',
            border: 'none',
            marginBottom: '8px',
            backgroundColor: '#F8F8EF',
            borderRadius: '8px',
            '&[data-active]': {
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            },
          },
          control: {
            backgroundColor: 'transparent',
          },
          content: {
            padding: '8px 16px 18px',
          },
        }}
      >
        {seriesData.map((series, index) => {
          const canExpand = isSeriesComplete(index);
          const isExpanded = expandedSeries === series.title;

          return (
            <Accordion.Item
              key={series.title}
              value={series.title}
              aria-disabled={!canExpand}
              bg={isExpanded ? '#ffffff' : '#F8F8EF'}
            >
              <Box className='w-full flex flex-col'>
                <Accordion.Control>
                  <Flex justify='space-between' align='center' w='100%'>
                    <Flex direction='column' style={{ flex: 1 }}>
                      <Text fw={500} size='sm'>
                        {series.title}
                      </Text>
                      {series.progress !== undefined &&
                        series.progress !== 0 && (
                          <>
                            <Progress
                              value={series.progress || 0}
                              color='#1D9B5E'
                              size='sm'
                              radius='xl'
                              style={{ width: '70%', marginTop: '8px' }}
                            />
                            <Text size='14px' c='dimmed' mt='xs'>
                              {series.progress === 100 ? (
                                <Text color='#1D9B5E'>
                                  Completed
                                </Text>
                              ) : (
                                `${series.progress}% Completed`
                              )}
                            </Text>
                          </>
                        )}
                    </Flex>
                    {canExpand ? (
                      isExpanded ? (
                        <IconChevronUp size={16} />
                      ) : (
                        <IconChevronDown size={16} />
                      )
                    ) : (
                      <img src={lockIcon} alt='Lock' width={16} />
                    )}
                  </Flex>
                </Accordion.Control>

                {series.levels && canExpand && (
                  <Accordion.Panel>
                    {series.levels.map((level) => (
                      <Box
                        key={level.value}
                        mb='sm'
                        style={{
                          borderRadius: '8px',
                          backgroundColor: isActive ? '#1D9B5E14' : '#DEDEDE66',
                        }}
                      >
                        <Flex
                          gap='xs'
                          p='xs'
                          onClick={() => handleLevelSelect(series.title, level)}
                          style={{
                            cursor: 'pointer',
                            borderRadius: '8px',
                            backgroundColor:
                              selectedLevel?.series === series.title &&
                              selectedLevel?.level === level.label
                                ? '#f0fdf4'
                                : '#DEDEDE66',
                          }}
                        >
                          <Flex align='center' gap='xs'>
                            <CustomRingProgress
                              size={40}
                              thickness={2}
                              sections={[
                                {
                                  value: level.progress || 0,
                                  color: '#1D9B5E',
                                },
                              ]}
                            />
                            <Flex direction='column'>
                              <Text size='md'>{level.label}</Text>
                              <Text
                                size='xs'
                                c={level.progress === 100 ? '#1D9B5E' : 'dimmed'}
                              >
                                {renderProgressText(level.progress)}
                              </Text>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Box>
                    ))}
                  </Accordion.Panel>
                )}
              </Box>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Card>
  );
};

export default ProgressSeriesTracker;
