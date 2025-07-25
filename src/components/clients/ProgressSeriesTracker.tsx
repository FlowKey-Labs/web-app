import { Card, Text, Flex, Box, Accordion, Progress } from "@mantine/core";
import CustomRingProgress from "../common/CustomRingProgress";
import lockIcon from "../../assets/icons/Lock.svg";
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import {
  Series,
  SeriesLevel,
  useProgressStore,
} from "../../store/progressStore";

const ProgressSeriesTracker = () => {
  const {
    selectedLevel,
    levelProgress,
    expandedSeries,
    seriesData,
    setSelectedLevel,
    setExpandedSeries,
    setViewMode,
    setActiveTab,
    setCurrentSeriesIndex,
    setCurrentLevelIndex,
  } = useProgressStore();

  const isSeriesComplete = (seriesIndex: number) => {
    if (seriesIndex === 0) return true;
    const prevSeries = seriesData[seriesIndex - 1];
    if (!prevSeries.levels) return true;
    return prevSeries.levels.every(
      (level) => (levelProgress[level.id] || 0) === 100
    );
  };

  const handleLevelSelect = (
    seriesTitle: string,
    level: SeriesLevel,
    seriesIndex: number,
    levelIndex: number
  ) => {
    setCurrentLevelIndex(levelIndex);
    setCurrentSeriesIndex(seriesIndex);
    setSelectedLevel({ ...level });
    setExpandedSeries(seriesTitle);
    setActiveTab("Progress Tracker");
    setViewMode("levels");
  };

  const calculateSeriesProgress = (series: Series) => {
    if (!series.levels || series.levels.length === 0) return 0;
    const totalProgress = series.levels.reduce(
      (acc, level) => acc + (level.progress || 0),
      0
    );
    return Math.round(totalProgress / series.levels.length);
  };

  const handleAccordionChange = (value: string) => {
    const seriesIndex = seriesData.findIndex((s) => s.title === value);
    if (seriesIndex > 0 && !isSeriesComplete(seriesIndex)) return;
    setExpandedSeries(expandedSeries === value ? null : value);
  };

  const renderProgressText = (progress?: number) => {
    if (progress === 100)
      return (
        <Text component="span" color="#1D9B5E" size="xs">
          Completed
        </Text>
      );
    return progress && progress > 0 ? `${progress}%` : null;
  };

  return (
    <Card 
      padding="sm" 
      radius="lg" 
      w="95%" 
      withBorder
      style={{
        maxHeight: '50vh',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '4px',
        },
      }}
    >
      <Accordion
        value={expandedSeries}
        onChange={(value) => handleAccordionChange(value || "")}
        chevron={null}
        styles={(theme) => ({
          root: {
            width: '100%',
          },
          item: {
            width: "100%",
            border: "none",
            marginBottom: "8px",
            backgroundColor: "#F8F8EF",
            borderRadius: "8px",
            '&[data-active]': {
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            },
          },
          control: { 
            backgroundColor: "transparent",
            padding: '12px 16px',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
          content: { 
            padding: "8px 16px 18px",
            overflow: 'visible',
          },
          chevron: {
            '&[data-rotate]': {
              transform: 'rotate(180deg)',
            },
          },
        })}
      >
        {seriesData.map((series, index) => {
          const canExpand = isSeriesComplete(index);
          const isExpanded = expandedSeries === series.title;
          const seriesProgress = calculateSeriesProgress(series);

          return (
            <Accordion.Item
              key={series.title}
              value={series.title}
              aria-disabled={!canExpand}
              bg={isExpanded ? "#ffffff" : "#F8F8EF"}
            >
              <Box className="w-full flex flex-col">
                <Accordion.Control>
                  <Flex justify="space-between" align="center" w="100%">
                    <Flex direction="column" style={{ flex: 1 }}>
                      <Text fw={500} size="sm">
                        {series.title}
                      </Text>
                      {series.description && <Text size="xs">
                        {series.description}
                      </Text>}
                      {series.levels && series.levels.length > 0 && (
                        <>
                          <Progress
                            value={seriesProgress}
                            color={seriesProgress === 100 ? "#1D9B5E" : '#FF9500'}
                            size="sm"
                            radius="xl"
                            style={{ width: "70%", marginTop: "8px" }}
                          />
                          <Text size="14px" c="dimmed" mt="xs">
                            {seriesProgress === 100 ? (
                              <Text component="span" color="#1D9B5E">
                                Completed
                              </Text>
                            ) : (
                              `${Math.round(seriesProgress)}% Completed`
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
                      <img src={lockIcon} alt="Lock" width={16} />
                    )}
                  </Flex>
                </Accordion.Control>

                {series.levels && canExpand && (
                  <Accordion.Panel>
                    {series.levels.map((level, levelIndex) => (
                      <Box
                        key={level.id}
                        mb="sm"
                        style={{
                          borderRadius: "8px",
                          backgroundColor:
                            level.id === selectedLevel?.id
                              ? "#ccffcc"
                              : "#F8F7F7",
                        }}
                      >
                        <Flex
                          gap="xs"
                          p="xs"
                          onClick={() =>
                            handleLevelSelect(
                              series.title,
                              level,
                              index,
                              levelIndex
                            )
                          }
                          style={{
                            cursor: "pointer",
                            borderRadius: "8px",
                            backgroundColor:
                              selectedLevel?.label === series.title &&
                              selectedLevel?.id === level.id
                                ? "#f0fdf4"
                                : "#DEDEDE66",
                          }}
                        >
                          <Flex align="center" gap="xs">
                            <CustomRingProgress
                              size={40}
                              thickness={3}
                              roundCaps
                              sections={[
                                {
                                  value:
                                    levelProgress[level.id] ||
                                    level.progress ||
                                    0,
                                  color: "#1D9B5E",
                                },
                              ]}
                            />
                            <Flex direction="column">
                              <Text size="md">{level.label}</Text>
                              <Text
                                size="xs"
                                c={
                                  level.progress === 100 ? "#1D9B5E" : "dimmed"
                                }
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
