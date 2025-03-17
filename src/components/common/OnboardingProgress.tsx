import { Group, Progress } from '@mantine/core';

export type OnboardingStep =
  | 'business-type'
  | 'team-members'
  | 'monthly-clients'
  | 'purpose';

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
}

export const OnboardingProgress = ({
  currentStep,
}: OnboardingProgressProps) => {
  const steps: OnboardingStep[] = [
    'business-type',
    'team-members',
    'monthly-clients',
    'purpose',
  ];

  const getProgressValue = (stepIndex: number) => {
    const currentStepIndex = steps.indexOf(currentStep);
    return stepIndex <= currentStepIndex ? 100 : 0;
  };

  return (
    <Group grow gap={6} mt='xs' w={200}>
      {steps.map((_, index) => (
        <Progress
          key={index}
          size='xs'
          h={6}
          radius='xl'
          color='#1D9B5E'
          value={getProgressValue(index)}
          transitionDuration={300}
          bg='##E2E8F0'
          styles={{
            root: {
              opacity: getProgressValue(index) === 0 ? 0.5 : 1,
              transition: 'opacity 300ms ease',
            },
          }}
        />
      ))}
    </Group>
  );
};
