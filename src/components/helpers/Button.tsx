import {
  Button as MantineButton,
  ButtonProps as MantineButtonProps,
} from '@mantine/core';
import { ReactNode } from 'react';

interface ButtonProps extends Omit<MantineButtonProps, 'children'> {
  children: ReactNode;
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default' | 'gradient';
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: string | number;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

const Button = ({
  children,
  variant = 'filled',
  color = 'blue',
  size = 'md',
  radius = 'sm',
  loading = false,
  fullWidth = false,
  disabled = false,
  leftSection,
  rightSection,
  type = 'button',
  onMouseEnter,
  onMouseLeave,
  onClick,
  ...props
}: ButtonProps) => {
  return (
    <MantineButton
      variant={variant}
      color={color}
      size={size}
      radius={radius}
      loading={loading}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      leftSection={leftSection}
      rightSection={rightSection}
      type={type}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {children}
    </MantineButton>
  );
};

export default Button;
