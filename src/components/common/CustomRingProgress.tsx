import {
    RingProgress,
    Text,
    RingProgressProps,
    MantineSize,
  } from '@mantine/core';
  import { ReactNode } from 'react';
  
  interface CustomRingProgressProps extends Omit<RingProgressProps, 'sections'> {
    value?: number;
    color?: string;
    sections?: { value: number; color: string; tooltip?: string }[];
    label?: ReactNode;
    size?: number;
    thickness?: number;
    roundCaps?: boolean;
  }
  
  const CustomRingProgress = ({
    value,
    color,
    sections,
    label,
    size,
    thickness,
    roundCaps,
    ...rest
  }: CustomRingProgressProps) => {
    const ringSections =
      sections || (value !== undefined && color ? [{ value, color }] : []);
  
    let labelTextSize: MantineSize = 'xl';
  
    if (size !== undefined) {
      const calculatedFontSize = size / 5;
      if (calculatedFontSize < 10) {
        labelTextSize = 'xs';
      } else if (calculatedFontSize < 12) {
        labelTextSize = 'sm';
      } else if (calculatedFontSize < 16) {
        labelTextSize = 'md';
      } else if (calculatedFontSize < 20) {
        labelTextSize = 'lg';
      } else {
        labelTextSize = 'xl';
      }
    }
  
    const defaultLabelContent =
      label === undefined && value !== undefined && color !== undefined ? (
        <Text c={color || 'teal'} fw={700} ta='center' size={labelTextSize}>
          {Math.round(value)}%
        </Text>
      ) : (
        label
      );
  
    return (
      <RingProgress
        sections={ringSections}
        label={defaultLabelContent}
        size={size}
        thickness={thickness}
        roundCaps={roundCaps}
        rootColor="white"
        {...rest}
      />
    );
  };
  
  export default CustomRingProgress;