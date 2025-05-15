import { useState, useEffect, useMemo } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import CustomRingProgress from "../common/CustomRingProgress";
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
} from "@mantine/core";
import {
  IconChevronRight,
  IconCheck,
  IconMoodSmile,
  IconUserBolt,
} from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import dropZoneIcon from "../../assets/icons/dropZone.svg";
import styles from "../accountSettings/GeneralSettings.module.css";
import previewEyeIcon from "../../assets/icons/previewEye.svg";
import Input from "../common/Input";
import {
  Outcome,
  Series,
  SeriesLevel,
  useProgressStore,
} from "../../store/progressStore";

import errorIcon from "../../assets/icons/error.svg";
import { notifications } from "@mantine/notifications";
import { useLoadProgressTrackerData } from "../../hooks/useLoadProgressTrackerData";
import {
  useGetProgressFeedback,
  useMarkOutcomeCompleted,
  useSubmitProgressFeedback,
  useUnmarkOutcomeIncomplete,
} from "../../hooks/reactQuery";

const ProgressTracker = ({ clientId }: { clientId: string }) => {
  const {
    selectedLevel,
    levelProgress,
    viewMode,
    setViewMode,
    updateLevelProgress,
    seriesData,
    goToNextLevel,
    goToPreviousLevel,
    currentLevelIndex,
    getFirstIncompleteLevel,
  } = useProgressStore();

  const methods = useForm({
    defaultValues: { feedback: "", attachments: [] as File[] },
  });

  const { reset } = methods;

  const { mutate: markComplete, isPending: markInProgress } =
    useMarkOutcomeCompleted();
  const { mutate: markIncomplete, isPending: unmarkInProgress } =
    useUnmarkOutcomeIncomplete();
  const { mutate: submitFeedback, isPending: submitFeedbackInProgress } =
    useSubmitProgressFeedback();
  const { data: levelFeedback } = useGetProgressFeedback(
    clientId || "",
    selectedLevel?.id || ""
  );
  console.log("selectedLevel?.id==>", selectedLevel?.id);
  console.log("levelFeedback==>", levelFeedback);

  useEffect(() => {
    if (levelFeedback) {
      reset({
        feedback: levelFeedback.feedback || "",
        // attachments: [],
      });
    }
  }, [levelFeedback, reset]);

  const { loadProgressData } = useLoadProgressTrackerData(clientId);
  const [
    shouldUpdateFirstIncompleteLevel,
    setShouldUpdateFirstIncompleteLevel,
  ] = useState(true);

  useEffect(() => {
    setShouldUpdateFirstIncompleteLevel(true);
    loadProgressData();
  }, []);

  useEffect(() => {
    if (shouldUpdateFirstIncompleteLevel && seriesData.length > 0) {
      getFirstIncompleteLevel(seriesData);
    }
  }, [seriesData, shouldUpdateFirstIncompleteLevel]);

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewLevelOutcomePercentage, setPreviewLevelOutcomePercentage] =
    useState(0);
  const [outcomeStatus, setOutcomeStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const previewLevelData = useMemo(() => {
    const levelId = selectedLevel?.id;

    let outcomes: Outcome[] = [];
    let completed: string[] = [];

    for (const series of seriesData) {
      const level = series?.levels?.find((lvl) => lvl.id === levelId);
      if (level) {
        outcomes = level.outcomes || [];
        completed = level.completed || [];
        break;
      }
    }

    return {
      title: selectedLevel?.label,
      outcomes,
      completed,
      assessedOn: "2024-02-15",
      dueDate: "2024-03-15",
    };
  }, [selectedLevel, seriesData]);

  // Calculate series progress for the current series
  const currentSeriesProgress = useMemo(() => {
    if (!selectedLevel) return 0;

    const findLevelById = (data: Series[], targetId: string) => {
      for (const series of data) {
        const level = series?.levels?.find(
          (lvl: SeriesLevel) => lvl.id === targetId
        );
        if (level) return level;
      }
      return null;
    };

    const series = findLevelById(seriesData, selectedLevel.id);
    return series?.progress || 0;
  }, [selectedLevel, seriesData, levelProgress]);

  useEffect(() => {
    if (!seriesData || seriesData.length === 0) return;

    const newStatus: { [id: string]: boolean } = {};

    seriesData.forEach((series) => {
      series?.levels?.forEach((level) => {
        const outcomes: Outcome[] = level.outcomes || [];
        const completed: string[] = level.completed || [];

        outcomes.forEach((outcome) => {
          const isCompleted = completed.some((c) => c === outcome.id);
          newStatus[outcome.id] = isCompleted;
        });
      });
    });

    setOutcomeStatus(newStatus);
  }, [seriesData]);

  useEffect(() => {
    if (!isPreviewMode && viewMode === "levels") {
      setViewMode("details");
    }
  }, [isPreviewMode, viewMode, setViewMode]);

  const handleOutcomeToggle = (outcome: Outcome) => {
    const isCompleted = outcomeStatus[outcome.id];

    const mutation = isCompleted ? markIncomplete : markComplete;

    setShouldUpdateFirstIncompleteLevel(false);

    mutation(
      { client_id: clientId, subskill_id: outcome.id },
      {
        onSuccess: () => {
          setOutcomeStatus((prev) => ({
            ...prev,
            [outcome.id]: !isCompleted,
          }));
          loadProgressData();
        },
      }
    );
  };

  useEffect(() => {
    if (!previewLevelData?.outcomes || !selectedLevel) return;
    const totalOutcomes = previewLevelData.outcomes.length;
    const completedOutcomes = previewLevelData.completed.length;
    const percentage = Math.round((completedOutcomes / totalOutcomes) * 100);
    setPreviewLevelOutcomePercentage(percentage);
    updateLevelProgress(selectedLevel?.id, percentage);
  }, [outcomeStatus, previewLevelData, selectedLevel, updateLevelProgress]);

  const onSubmit = (data: { feedback: string; attachments: File[] }) => {
    if (previewLevelOutcomePercentage < 100) {
      notifications.show({
        title: "Error",
        message: "Please complete all outcomes before moving to the next level",
        color: "red",
        radius: "md",
        icon: (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200">
            <img src={errorIcon} alt="Error" className="w-4 h-4" />
          </span>
        ),
        withBorder: true,
        autoClose: 3000,
        position: "top-right",
      });
      return;
    }
    if (
      !data.attachments?.length &&
      (!data.feedback || levelFeedback?.attachment)
    ) {
      goToNextLevel();
      return;
    }
    submitFeedback(
      {
        client_id: clientId,
        subcategory_id: selectedLevel?.id || "",
        feedback: data.feedback,
        attachment: data.attachments?.[0],
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Feedback submitted successfully",
            color: "green",
            radius: "md",
            icon: (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-200">
                <img src={dropZoneIcon} alt="Success" className="w-4 h-4" />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: "top-right",
          });
          reset({ feedback: "", attachments: [] });
          goToNextLevel();
        },
        onError: (error) => {
          console.error("Error submitting feedback:", error);
          notifications.show({
            title: "Error",
            message: "Failed to submit feedback",
            color: "red",
            radius: "md",
            icon: (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-200">
                <img src={errorIcon} alt="Error" className="w-4 h-4" />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: "top-right",
          });
        },
      }
    );
  };

  if (isPreviewMode && previewLevelData) {
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full">
          <Box className="w-full">
            <Flex justify="space-between" align="center" mb="md">
              <Text size="2rem" fw={700}>
                {previewLevelData.title}
              </Text>
            </Flex>
            <Text size="lg" fw={600} mb="xs">
              Learning Outcomes
            </Text>
            <Text size="sm" c="dimmed" mb="lg">
              Assessed on: {previewLevelData.assessedOn}
            </Text>
            <div className="space-y-3 mb-6">
              {previewLevelData.outcomes.map(
                (outcome: Outcome, index: number) => {
                  const isCompleted = outcomeStatus[outcome.id] || false;
                  return (
                    <Card
                      key={index}
                      padding="md"
                      radius="md"
                      withBorder
                      bg="#DEDEDE66"
                      className={`flex items-start space-x-3 ${
                        isCompleted ? "bg-green-50" : "bg-white"
                      }`}
                    >
                      <Flex justify="space-between" align="center" gap="md">
                        <Checkbox
                          checked={isCompleted}
                          onChange={() => handleOutcomeToggle(outcome)}
                          color="green"
                          radius="xl"
                          icon={IconCheck}
                          disabled={markInProgress || unmarkInProgress}
                          size="md"
                        />
                        <Box>
                          <Text
                            size="sm"
                            fw={500}
                            c={isCompleted ? "dimmed" : "black"}
                          >
                            {outcome.label}
                          </Text>
                          {isCompleted && (
                            <Text size="xs" c="green">
                              Completed
                            </Text>
                          )}
                        </Box>
                      </Flex>
                    </Card>
                  );
                }
              )}
            </div>
            <Controller
              name="feedback"
              control={methods.control}
              render={({ field }) => (
                <Input
                  label="Feedback"
                  type="textarea"
                  placeholder="Enter your feedback"
                  rows={4}
                  {...field}
                />
              )}
            />
            <Text size="sm" fw={500} mb="xs">
              Attach Photos or videos
            </Text>
            {levelFeedback?.attachment ? (
              <a
                href={levelFeedback.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 underline"
              >
                View existing attachment
              </a>
            ) : (
              <Controller
                name="attachments"
                control={methods.control}
                render={({ field: { onChange, value } }) => (
                  <Dropzone
                    onDrop={(files) => onChange([...(value || []), ...files])}
                    onReject={(files) => console.log("rejected files", files)}
                    maxSize={20 * 1024 ** 2}
                    className={styles.dropzoneRoot}
                    accept={IMAGE_MIME_TYPE}
                  >
                    <Flex justify="center" align="center" gap="md">
                      <img
                        src={dropZoneIcon}
                        className="text-gray-500 w-8 h-8"
                      />
                      <Box>
                        <Text size="sm" c="dimmed">
                          Drag and drop a file here, or{" "}
                          <Text component="span" c="secondary" fw={500}>
                            Browse
                          </Text>
                        </Text>
                        <Text size="xs" c="dimmed">
                          Max size: 20MB
                        </Text>
                      </Box>
                    </Flex>
                  </Dropzone>
                )}
              />
            )}
            <Controller
              name="attachments"
              control={methods.control}
              render={({ field: { value } }) => (
                <div className="mb-4">
                  {value?.map((file: File, index: number) => (
                    <div key={index} className="flex items-center mb-2">
                      <Text size="sm">{file.name}</Text>
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        ml="sm"
                        onClick={() => {
                          const newFiles = [...(value || [])];
                          newFiles.splice(index, 1);
                          methods.setValue("attachments", newFiles);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            />
            <Flex justify="space-between" mt="xl">
              <Button
                variant="outline"
                color="#1D9B5E"
                radius="md"
                size="sm"
                onClick={() => {
                  if (currentLevelIndex > 0) {
                    goToPreviousLevel();
                  } else {
                    setViewMode("details");
                    setIsPreviewMode(false);
                  }
                }}
              >
                Back
              </Button>
              <Button color="#1D9B5E" radius="md" size="sm" type="submit">
                {submitFeedbackInProgress ? "Submitting feedback..." : "Next"}
              </Button>
            </Flex>
          </Box>
        </form>
      </FormProvider>
    );
  }

  return (
    <Box className="w-full">
      <Card shadow="sm" padding="md" radius="lg" withBorder mb="md">
        <Flex justify="space-between" align="center">
          <Flex align="center" gap="lg">
            <CustomRingProgress
              size={150}
              thickness={10}
              roundCaps
              sections={[{ value: currentSeriesProgress, color: "#1D9B5E" }]}
              label={
                <Flex direction="column" justify="center" align="center">
                  <Text size="10px" c="black">
                    Completion
                  </Text>
                  <Text c="#1D9B5E" fw={700} ta="center" size="xl">
                    {currentSeriesProgress}%
                  </Text>
                </Flex>
              }
            />
            <Box>
              <Text size="lg" fw={600} c="#8A8D8E">
                {selectedLevel?.label || "No Series Selected"}
              </Text>
              <Text size="xs" c="#8A8D8E">
                Current Track Progress
              </Text>
            </Box>
          </Flex>
          <Button
            leftSection={<img src={previewEyeIcon} alt="Preview" />}
            color="#1D9B5E"
            radius="md"
            size="md"
            onClick={() => {
              setIsPreviewMode(true);
              setViewMode("levels");
            }}
          >
            Preview
          </Button>
        </Flex>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
        <Card shadow="sm" padding="xl" radius="lg" withBorder>
          <Flex align="center" gap="sm" mb="xl">
            <IconMoodSmile size={24} color="#1D9B5E" />
            <Text fw={600} size="lg" c="#8A8D8E">
              Steady Learning Progress!
            </Text>
          </Flex>
          <Text size="md" c="dimmed" mb="md">
            Your guidance has clearly made a positive impact!
          </Text>
          <Text size="xs" c="dimmed" mb="xl">
            Jakes Muli has made a steady strides in their learning journey. A
            testament to both their dedication and your effective instruction
          </Text>
          <Flex justify="space-between" align="center" mb="xs">
            <Text size="xs" c="#0F2028">
              Progress
            </Text>
            <Badge size="md" c="#1D9B5E" fw={500} bg="#ECFDF3">
              {currentSeriesProgress}% ↑
            </Badge>
          </Flex>
          <Progress
            value={currentSeriesProgress}
            color={currentSeriesProgress === 100 ? "#1D9B5E" : "#FF9500"}
            radius="sm"
            mb="sm"
          />
          <Text size="sm" fw={500} c="#8A8D8E">
            Current Learning Progress
          </Text>
        </Card>

        <Box>
          {previewLevelData && (
            <Card shadow="sm" padding="xl" radius="lg" withBorder mb="md">
              <Flex justify="space-between" align="center">
                <Box w="70%">
                  <Text fw={600} c="#8A8D8E">
                    Jump right back
                  </Text>
                  <Text size="xs" c="#8A8D8E">
                    {selectedLevel?.label}
                  </Text>
                  <Progress
                    value={previewLevelOutcomePercentage}
                    color={
                      previewLevelOutcomePercentage === 100
                        ? "#1D9B5E"
                        : "#FF9500"
                    }
                    radius="sm"
                    mt="sm"
                  />
                  <Button
                    variant="transparent"
                    color="#0F2028"
                    rightSection={<IconChevronRight size={14} />}
                    p={0}
                    mt="sm"
                    size="sm"
                    onClick={() => {
                      setIsPreviewMode(true);
                      setViewMode("levels");
                    }}
                  >
                    Continue Learning
                  </Button>
                </Box>
                <Divider orientation="vertical" size="xs" />
                <Text size="2rem" fw={600} c="#8A8D8E">
                  {previewLevelOutcomePercentage || 0}%
                </Text>
              </Flex>
            </Card>
          )}
          <Card shadow="sm" padding="lg" radius="lg" withBorder>
            <Flex justify="space-between" align="center">
              <Box w="70%">
                <Text fw={600} c="#8A8D8E">
                  Average Assessment Score
                </Text>
                <Text size="xs" c="#8A8D8E">
                  Based on validated Checkpoints
                </Text>
                <Button
                  variant="transparent"
                  color="#0F2028"
                  rightSection={<IconChevronRight size={14} />}
                  p={0}
                  mt="sm"
                  size="sm"
                >
                  View Report
                </Button>
              </Box>
              <Divider orientation="vertical" size="xs" />
              <Text size="2rem" fw={600} c="#8A8D8E">
                0%
              </Text>
            </Flex>
          </Card>
        </Box>
      </SimpleGrid>
      <Card shadow="sm" radius="lg" withBorder p="0rem">
        <Flex align="stretch" gap="md">
          <Flex
            direction="row"
            align="center"
            p="md"
            style={{
              backgroundColor: "var(--mantine-color-green-5)",
              flex: 1.5,
              borderRadius: "var(--mantine-radius-lg)",
            }}
          >
            <Box ta="center" pr="md" w="30%">
              <Text size="2rem" fw={600} c="white">
                100%
              </Text>
              <Text size="10px" c="white" mt="xs">
                Avg presence
              </Text>
            </Box>
            <Divider orientation="vertical" color="rgba(255,255,255,0.5)" />
            <Flex direction="column" align="center" pl="md" gap="sm">
              <IconUserBolt size={14} color="white" className="self-start" />
              <Text size="xs" c="white">
                Excellent presence and engagement. A dedicated student worth
                acknowledging!
              </Text>
            </Flex>
          </Flex>
          <Flex
            direction="column"
            justify="center"
            align="center"
            p="md"
            style={{ flex: 1 }}
          >
            <Text size="2rem" fw={500}>
              12
              <Text component="span" size="1rem" c="dimmed" fw={500}>
                /16
              </Text>
            </Text>
            <Text size="sm" c="dimmed">
              Total Assessments
            </Text>
          </Flex>
          <Divider orientation="vertical" />
          <Flex
            direction="column"
            justify="center"
            align="center"
            p="md"
            style={{ flex: 1 }}
            pos="relative"
          >
            <Text size="2rem" fw={500}>
              1
            </Text>
            <Text size="xs" c="dimmed">
              Total Absences
            </Text>
            <Button
              variant="transparent"
              color="#1D9B5E"
              rightSection={<IconChevronRight size={14} />}
              p={0}
              pos="absolute"
              top={10}
              right={10}
              styles={{ label: { fontSize: "var(--mantine-font-size-xs)" } }}
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
